"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeTransaction = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_sns_1 = require("@aws-sdk/client-sns");
/**
 * AcknowledgeTransaction handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
const acknowledgeTransaction = async (route, requestBody) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // first check whether we have a valid request body.
        if (requestBody) {
            // parse the incoming request body data as a JSON object
            const requestBodyParsed = JSON.parse(requestBody);
            const requestData = requestBodyParsed["data"] ? requestBodyParsed["data"] : null;
            // perform some validations based on what is expected in terms of the incoming data model and its mapping
            if (requestBodyParsed["data"] && requestBodyParsed["timestamp"] && requestData &&
                requestData["cardId"] && requestData["memberId"] && requestData["transaction"] &&
                requestData["transaction"]["cardId"] && requestData["transaction"]["created"] &&
                requestData["transaction"]["currencyCode"] && requestData["transaction"]["created"] &&
                requestData["transaction"]["merchantCategoryCode"]) {
                // filter based on whether an incoming transaction is a redeemable offer or not
                if (requestData["transaction"]["amount"] && requestData["transaction"]["brandId"] &&
                    requestData["transaction"]["loyaltyProgramId"] && requestData["transaction"]["rewardAmount"] &&
                    requestData["transaction"]["storeId"]) {
                    // call the Olive Client API here, in order to call the appropriate endpoints for this handler
                    const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
                    // execute the member details retrieval call, in order to get the Moonbeam userId to be used in associating a transaction with a Moonbeam user
                    const response = await oliveClient.getMemberDetails(requestData["memberId"]);
                    // check to see if the member details call was executed successfully
                    if (response && !response.errorMessage && !response.errorType && response.data && response.data.length !== 0) {
                        // build the transaction object from the incoming request body
                        const transaction = {
                            id: response.data,
                            memberId: requestData["memberId"],
                            storeId: requestData["transaction"]["storeId"],
                            brandId: requestData["transaction"]["brandId"],
                            cardId: requestData["transaction"]["cardId"],
                            category: requestData["transaction"]["merchantCategoryCode"],
                            currencyCode: requestData["transaction"]["currencyCode"],
                            transactionId: requestData["transaction"]["created"],
                            // set the status of all incoming transactions to be pending, until we get a status change and/or until the cashback is reimbursed to the customer
                            transactionStatus: moonbeam_models_1.TransactionsStatus.Pending,
                            // the type of this transaction will be an offer redeemed type for now. In the future when we process different types of transactions, this might change
                            transactionType: moonbeam_models_1.TransactionType.OfferRedeemed,
                            /**
                             * at creation time, these timestamps won't be converted appropriately, to what we expect them to look like. That conversion will be done all at
                             * processing time, but it will all depend on the creation time of the transaction, which is why that is passed for all these values below
                             */
                            timestamp: 0,
                            createdAt: requestData["transaction"]["created"],
                            updatedAt: requestData["transaction"]["created"],
                            rewardAmount: requestData["transaction"]["rewardAmount"],
                            totalAmount: requestData["transaction"]["amount"],
                            // we start with 0 dollars credited to the customer, since the whole reward amount is pending credit at transaction creation time
                            creditedCashbackAmount: "0",
                            pendingCashbackAmount: requestData["transaction"]["rewardAmount"]
                        };
                        // initializing the SNS Client
                        const snsClient = new client_sns_1.SNSClient({ region: region });
                        /**
                         * drop the transaction as a message to the transactions processing topic
                         *
                         * note: in the future when we will have other types of transactions, other than offer based ones, we will need to add a filter
                         * through the message attributes of the topic, so that only messages with specific filters get dropped to a particular processing
                         * queue.
                         */
                        const transactionReceipt = await snsClient.send(new client_sns_1.PublishCommand({
                            TopicArn: process.env.TRANSACTIONS_PROCESSING_TOPIC_ARN,
                            Message: JSON.stringify(transaction),
                            /**
                             * the message group id, will be represented by the user id, so that we can group transaction messages for a particular user id,
                             * and sort them in the FIFO processing topic accordingly
                             */
                            MessageGroupId: transaction.id
                        }));
                        // ensure that the transaction message was properly sent to the appropriate processing topic
                        if (transactionReceipt && transactionReceipt.MessageId && transactionReceipt.MessageId.length !== 0 &&
                            transactionReceipt.SequenceNumber && transactionReceipt.SequenceNumber.length !== 0) {
                            /**
                             * the transaction has been successfully dropped into the topic, and will be picked up by the transactions consumer and other
                             * services, like the notifications service consumer.
                             */
                            console.log(`Transaction successfully sent to topic for processing with receipt information: ${transactionReceipt.MessageId} ${transactionReceipt.SequenceNumber}`);
                            return {
                                statusCode: 202,
                                body: JSON.stringify({
                                    data: `Transaction acknowledged!`
                                })
                            };
                        }
                        else {
                            const errorMessage = `Unexpected error while sending the transaction message further!`;
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
                        const errorMessage = `Unexpected response structure returned from the member details call!`;
                        console.log(errorMessage);
                        /**
                         * if there are errors associated with the call, just return the error message and error type from the upstream client
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
                    const errorMessage = `Transaction is not a redeemable offer. Not processing.`;
                    console.log(`${errorMessage} ${requestBody}`);
                    /**
                     * return a 2xx response here, since this is not a true error worth retrying the processing, but rather an indication of filtering
                     * there's no need to indicate that Olive should retry sending this message, since we don't want to process it for now, for redeemed offers purposes
                     */
                    return {
                        statusCode: 202,
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
exports.acknowledgeTransaction = acknowledgeTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VUcmFuc2FjdGlvbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL0Fja25vd2xlZGdlVHJhbnNhY3Rpb25IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQU9tQztBQUNuQyxvREFBOEQ7QUFFOUQ7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBRSxXQUEwQixFQUFrQyxFQUFFO0lBQ3RILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0RBQW9EO1FBQ3BELElBQUksV0FBVyxFQUFFO1lBQ2Isd0RBQXdEO1lBQ3hELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRCxNQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUVqRix5R0FBeUc7WUFDekcsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXO2dCQUMxRSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUM7Z0JBQzlFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM3RSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDbkYsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEVBQUU7Z0JBRXBELCtFQUErRTtnQkFDL0UsSUFBSSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztvQkFDN0UsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQztvQkFDNUYsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUV2Qyw4RkFBOEY7b0JBQzlGLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFFbkUsOElBQThJO29CQUM5SSxNQUFNLFFBQVEsR0FBMEIsTUFBTSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBRXBHLG9FQUFvRTtvQkFDcEUsSUFBSSxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDMUcsOERBQThEO3dCQUM5RCxNQUFNLFdBQVcsR0FBZ0I7NEJBQzdCLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSTs0QkFDakIsUUFBUSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUM7NEJBQ2pDLE9BQU8sRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM5QyxPQUFPLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDOUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUM7NEJBQzVDLFFBQVEsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsc0JBQXNCLENBQUM7NEJBQzVELFlBQVksRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDOzRCQUN4RCxhQUFhLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDcEQsa0pBQWtKOzRCQUNsSixpQkFBaUIsRUFBRSxvQ0FBa0IsQ0FBQyxPQUFPOzRCQUM3Qyx3SkFBd0o7NEJBQ3hKLGVBQWUsRUFBRSxpQ0FBZSxDQUFDLGFBQWE7NEJBQzlDOzs7K0JBR0c7NEJBQ0gsU0FBUyxFQUFFLENBQUM7NEJBQ1osU0FBUyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQ2hELFNBQVMsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUNoRCxZQUFZLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQzs0QkFDeEQsV0FBVyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUM7NEJBQ2pELGlJQUFpSTs0QkFDakksc0JBQXNCLEVBQUUsR0FBRzs0QkFDM0IscUJBQXFCLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQzt5QkFDcEUsQ0FBQTt3QkFFRCw4QkFBOEI7d0JBQzlCLE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO3dCQUVsRDs7Ozs7OzJCQU1HO3dCQUNILE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQWMsQ0FBQzs0QkFDL0QsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWtDOzRCQUN4RCxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7NEJBQ3BDOzs7K0JBR0c7NEJBQ0gsY0FBYyxFQUFFLFdBQVcsQ0FBQyxFQUFFO3lCQUNqQyxDQUFDLENBQUMsQ0FBQzt3QkFFSiw0RkFBNEY7d0JBQzVGLElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsU0FBUyxJQUFJLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQzs0QkFDL0Ysa0JBQWtCLENBQUMsY0FBYyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUNyRjs7OytCQUdHOzRCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsbUZBQW1GLGtCQUFrQixDQUFDLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDOzRCQUVwSyxPQUFPO2dDQUNILFVBQVUsRUFBRSxHQUFHO2dDQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29DQUNqQixJQUFJLEVBQUUsMkJBQTJCO2lDQUNwQyxDQUFDOzZCQUNMLENBQUE7eUJBQ0o7NkJBQU07NEJBQ0gsTUFBTSxZQUFZLEdBQUcsaUVBQWlFLENBQUM7NEJBQ3ZGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBRTFCOzs7K0JBR0c7NEJBQ0gsT0FBTztnQ0FDSCxVQUFVLEVBQUUsR0FBRztnQ0FDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQ0FDakIsSUFBSSxFQUFFLElBQUk7b0NBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGFBQWE7b0NBQzlDLFlBQVksRUFBRSxZQUFZO2lDQUM3QixDQUFDOzZCQUNMLENBQUE7eUJBQ0o7cUJBQ0o7eUJBQU07d0JBQ0gsTUFBTSxZQUFZLEdBQUcsc0VBQXNFLENBQUM7d0JBQzVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBRTFCOzs7MkJBR0c7d0JBQ0gsT0FBTzs0QkFDSCxVQUFVLEVBQUUsR0FBRzs0QkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQ0FDakIsSUFBSSxFQUFFLElBQUk7Z0NBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7Z0NBQ2hELFlBQVksRUFBRSxZQUFZOzZCQUM3QixDQUFDO3lCQUNMLENBQUE7cUJBQ0o7aUJBQ0o7cUJBQU07b0JBQ0gsTUFBTSxZQUFZLEdBQUcsd0RBQXdELENBQUM7b0JBQzlFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQztvQkFFOUM7Ozt1QkFHRztvQkFDSCxPQUFPO3dCQUNILFVBQVUsRUFBRSxHQUFHO3dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDOzRCQUNqQixJQUFJLEVBQUUsSUFBSTs0QkFDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsYUFBYTs0QkFDOUMsWUFBWSxFQUFFLFlBQVk7eUJBQzdCLENBQUM7cUJBQ0wsQ0FBQTtpQkFDSjthQUNKO2lCQUFNO2dCQUNILHlCQUF5QjtnQkFDekIsTUFBTSxZQUFZLEdBQUcsaUNBQWlDLENBQUM7Z0JBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFFOUM7OzttQkFHRztnQkFDSCxPQUFPO29CQUNILFVBQVUsRUFBRSxHQUFHO29CQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO3dCQUNqQixJQUFJLEVBQUUsSUFBSTt3QkFDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTt3QkFDaEQsWUFBWSxFQUFFLFlBQVk7cUJBQzdCLENBQUM7aUJBQ0wsQ0FBQTthQUNKO1NBQ0o7YUFBTTtZQUNILHFFQUFxRTtZQUNyRSxNQUFNLFlBQVksR0FBRyxpQ0FBaUMsQ0FBQztZQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFFOUM7OztlQUdHO1lBQ0gsT0FBTztnQkFDSCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsSUFBSSxFQUFFLElBQUk7b0JBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7b0JBQ2hELFlBQVksRUFBRSxZQUFZO2lCQUM3QixDQUFDO2FBQ0wsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE1BQU0sWUFBWSxHQUFHLHFDQUFxQyxLQUFLLFVBQVUsQ0FBQztRQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFeEM7OztXQUdHO1FBQ0gsT0FBTztZQUNILFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxJQUFJO2dCQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO2dCQUNoRCxZQUFZLEVBQUUsWUFBWTthQUM3QixDQUFDO1NBQ0wsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBdE1ZLFFBQUEsc0JBQXNCLDBCQXNNbEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FQSUdhdGV3YXlQcm94eVJlc3VsdH0gZnJvbSBcImF3cy1sYW1iZGEvdHJpZ2dlci9hcGktZ2F0ZXdheS1wcm94eVwiO1xuaW1wb3J0IHtcbiAgICBNZW1iZXJEZXRhaWxzUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgVHJhbnNhY3Rpb24sXG4gICAgVHJhbnNhY3Rpb25zRXJyb3JUeXBlLFxuICAgIFRyYW5zYWN0aW9uc1N0YXR1cyxcbiAgICBUcmFuc2FjdGlvblR5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UHVibGlzaENvbW1hbmQsIFNOU0NsaWVudH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zbnNcIjtcblxuLyoqXG4gKiBBY2tub3dsZWRnZVRyYW5zYWN0aW9uIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gcm91dGUgcmVxdWVzdCByb3V0ZSwgY29tcG9zZWQgb2YgSFRUUCBWZXJiIGFuZCBIVFRQIFBhdGhcbiAqIEBwYXJhbSByZXF1ZXN0Qm9keSByZXF1ZXN0IGJvZHkgaW5wdXQsIHBhc3NlZCBieSB0aGUgY2FsbGVyIHRocm91Z2ggdGhlIEFQSSBHYXRld2F5IGV2ZW50XG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBUElHYXRld2F5UHJveHlSZXN1bHR9XG4gKi9cbmV4cG9ydCBjb25zdCBhY2tub3dsZWRnZVRyYW5zYWN0aW9uID0gYXN5bmMgKHJvdXRlOiBzdHJpbmcsIHJlcXVlc3RCb2R5OiBzdHJpbmcgfCBudWxsKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBmaXJzdCBjaGVjayB3aGV0aGVyIHdlIGhhdmUgYSB2YWxpZCByZXF1ZXN0IGJvZHkuXG4gICAgICAgIGlmIChyZXF1ZXN0Qm9keSkge1xuICAgICAgICAgICAgLy8gcGFyc2UgdGhlIGluY29taW5nIHJlcXVlc3QgYm9keSBkYXRhIGFzIGEgSlNPTiBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RCb2R5UGFyc2VkID0gSlNPTi5wYXJzZShyZXF1ZXN0Qm9keSk7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXSA/IHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXSA6IG51bGw7XG5cbiAgICAgICAgICAgIC8vIHBlcmZvcm0gc29tZSB2YWxpZGF0aW9ucyBiYXNlZCBvbiB3aGF0IGlzIGV4cGVjdGVkIGluIHRlcm1zIG9mIHRoZSBpbmNvbWluZyBkYXRhIG1vZGVsIGFuZCBpdHMgbWFwcGluZ1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXSAmJiByZXF1ZXN0Qm9keVBhcnNlZFtcInRpbWVzdGFtcFwiXSAmJiByZXF1ZXN0RGF0YSAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1wiY2FyZElkXCJdICYmIHJlcXVlc3REYXRhW1wibWVtYmVySWRcIl0gJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXSAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjYXJkSWRcIl0gJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNyZWF0ZWRcIl0gJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3VycmVuY3lDb2RlXCJdICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjcmVhdGVkXCJdICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcIm1lcmNoYW50Q2F0ZWdvcnlDb2RlXCJdKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgYmFzZWQgb24gd2hldGhlciBhbiBpbmNvbWluZyB0cmFuc2FjdGlvbiBpcyBhIHJlZGVlbWFibGUgb2ZmZXIgb3Igbm90XG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJhbW91bnRcIl0gJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImJyYW5kSWRcIl0gJiZcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImxveWFsdHlQcm9ncmFtSWRcIl0gJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInJld2FyZEFtb3VudFwiXSAmJlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wic3RvcmVJZFwiXSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIG1lbWJlciBkZXRhaWxzIHJldHJpZXZhbCBjYWxsLCBpbiBvcmRlciB0byBnZXQgdGhlIE1vb25iZWFtIHVzZXJJZCB0byBiZSB1c2VkIGluIGFzc29jaWF0aW5nIGEgdHJhbnNhY3Rpb24gd2l0aCBhIE1vb25iZWFtIHVzZXJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2U6IE1lbWJlckRldGFpbHNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE1lbWJlckRldGFpbHMocmVxdWVzdERhdGFbXCJtZW1iZXJJZFwiXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0IGZyb20gdGhlIGluY29taW5nIHJlcXVlc3QgYm9keVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByZXNwb25zZS5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiByZXF1ZXN0RGF0YVtcIm1lbWJlcklkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSWQ6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJzdG9yZUlkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kSWQ6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJicmFuZElkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNhcmRJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcIm1lcmNoYW50Q2F0ZWdvcnlDb2RlXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZTogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImN1cnJlbmN5Q29kZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHN0YXR1cyBvZiBhbGwgaW5jb21pbmcgdHJhbnNhY3Rpb25zIHRvIGJlIHBlbmRpbmcsIHVudGlsIHdlIGdldCBhIHN0YXR1cyBjaGFuZ2UgYW5kL29yIHVudGlsIHRoZSBjYXNoYmFjayBpcyByZWltYnVyc2VkIHRvIHRoZSBjdXN0b21lclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzOiBUcmFuc2FjdGlvbnNTdGF0dXMuUGVuZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdHlwZSBvZiB0aGlzIHRyYW5zYWN0aW9uIHdpbGwgYmUgYW4gb2ZmZXIgcmVkZWVtZWQgdHlwZSBmb3Igbm93LiBJbiB0aGUgZnV0dXJlIHdoZW4gd2UgcHJvY2VzcyBkaWZmZXJlbnQgdHlwZXMgb2YgdHJhbnNhY3Rpb25zLCB0aGlzIG1pZ2h0IGNoYW5nZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZTogVHJhbnNhY3Rpb25UeXBlLk9mZmVyUmVkZWVtZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogYXQgY3JlYXRpb24gdGltZSwgdGhlc2UgdGltZXN0YW1wcyB3b24ndCBiZSBjb252ZXJ0ZWQgYXBwcm9wcmlhdGVseSwgdG8gd2hhdCB3ZSBleHBlY3QgdGhlbSB0byBsb29rIGxpa2UuIFRoYXQgY29udmVyc2lvbiB3aWxsIGJlIGRvbmUgYWxsIGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogcHJvY2Vzc2luZyB0aW1lLCBidXQgaXQgd2lsbCBhbGwgZGVwZW5kIG9uIHRoZSBjcmVhdGlvbiB0aW1lIG9mIHRoZSB0cmFuc2FjdGlvbiwgd2hpY2ggaXMgd2h5IHRoYXQgaXMgcGFzc2VkIGZvciBhbGwgdGhlc2UgdmFsdWVzIGJlbG93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNyZWF0ZWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnQ6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJyZXdhcmRBbW91bnRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxBbW91bnQ6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJhbW91bnRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Ugc3RhcnQgd2l0aCAwIGRvbGxhcnMgY3JlZGl0ZWQgdG8gdGhlIGN1c3RvbWVyLCBzaW5jZSB0aGUgd2hvbGUgcmV3YXJkIGFtb3VudCBpcyBwZW5kaW5nIGNyZWRpdCBhdCB0cmFuc2FjdGlvbiBjcmVhdGlvbiB0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudDogXCIwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wicmV3YXJkQW1vdW50XCJdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgU05TIENsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc25zQ2xpZW50ID0gbmV3IFNOU0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBkcm9wIHRoZSB0cmFuc2FjdGlvbiBhcyBhIG1lc3NhZ2UgdG8gdGhlIHRyYW5zYWN0aW9ucyBwcm9jZXNzaW5nIHRvcGljXG4gICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogbm90ZTogaW4gdGhlIGZ1dHVyZSB3aGVuIHdlIHdpbGwgaGF2ZSBvdGhlciB0eXBlcyBvZiB0cmFuc2FjdGlvbnMsIG90aGVyIHRoYW4gb2ZmZXIgYmFzZWQgb25lcywgd2Ugd2lsbCBuZWVkIHRvIGFkZCBhIGZpbHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICogdGhyb3VnaCB0aGUgbWVzc2FnZSBhdHRyaWJ1dGVzIG9mIHRoZSB0b3BpYywgc28gdGhhdCBvbmx5IG1lc3NhZ2VzIHdpdGggc3BlY2lmaWMgZmlsdGVycyBnZXQgZHJvcHBlZCB0byBhIHBhcnRpY3VsYXIgcHJvY2Vzc2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICogcXVldWUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uUmVjZWlwdCA9IGF3YWl0IHNuc0NsaWVudC5zZW5kKG5ldyBQdWJsaXNoQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9waWNBcm46IHByb2Nlc3MuZW52LlRSQU5TQUNUSU9OU19QUk9DRVNTSU5HX1RPUElDX0FSTiEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWVzc2FnZTogSlNPTi5zdHJpbmdpZnkodHJhbnNhY3Rpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSBtZXNzYWdlIGdyb3VwIGlkLCB3aWxsIGJlIHJlcHJlc2VudGVkIGJ5IHRoZSB1c2VyIGlkLCBzbyB0aGF0IHdlIGNhbiBncm91cCB0cmFuc2FjdGlvbiBtZXNzYWdlcyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIgaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogYW5kIHNvcnQgdGhlbSBpbiB0aGUgRklGTyBwcm9jZXNzaW5nIHRvcGljIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWVzc2FnZUdyb3VwSWQ6IHRyYW5zYWN0aW9uLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlIHdhcyBwcm9wZXJseSBzZW50IHRvIHRoZSBhcHByb3ByaWF0ZSBwcm9jZXNzaW5nIHRvcGljXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNhY3Rpb25SZWNlaXB0ICYmIHRyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWQgJiYgdHJhbnNhY3Rpb25SZWNlaXB0Lk1lc3NhZ2VJZC5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblJlY2VpcHQuU2VxdWVuY2VOdW1iZXIgJiYgdHJhbnNhY3Rpb25SZWNlaXB0LlNlcXVlbmNlTnVtYmVyLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSB0cmFuc2FjdGlvbiBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgZHJvcHBlZCBpbnRvIHRoZSB0b3BpYywgYW5kIHdpbGwgYmUgcGlja2VkIHVwIGJ5IHRoZSB0cmFuc2FjdGlvbnMgY29uc3VtZXIgYW5kIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogc2VydmljZXMsIGxpa2UgdGhlIG5vdGlmaWNhdGlvbnMgc2VydmljZSBjb25zdW1lci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVHJhbnNhY3Rpb24gc3VjY2Vzc2Z1bGx5IHNlbnQgdG8gdG9waWMgZm9yIHByb2Nlc3Npbmcgd2l0aCByZWNlaXB0IGluZm9ybWF0aW9uOiAke3RyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWR9ICR7dHJhbnNhY3Rpb25SZWNlaXB0LlNlcXVlbmNlTnVtYmVyfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBgVHJhbnNhY3Rpb24gYWNrbm93bGVkZ2VkIWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNlbmRpbmcgdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UgZnVydGhlciFgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCBzZW5kaW5nIHRoZSBtZXNzYWdlIHRvIHRoZSB0b3BpYy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5wcm9jZXNzYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIG1lbWJlciBkZXRhaWxzIGNhbGwhYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFRyYW5zYWN0aW9uIGlzIG5vdCBhIHJlZGVlbWFibGUgb2ZmZXIuIE5vdCBwcm9jZXNzaW5nLmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXF1ZXN0Qm9keX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogcmV0dXJuIGEgMnh4IHJlc3BvbnNlIGhlcmUsIHNpbmNlIHRoaXMgaXMgbm90IGEgdHJ1ZSBlcnJvciB3b3J0aCByZXRyeWluZyB0aGUgcHJvY2Vzc2luZywgYnV0IHJhdGhlciBhbiBpbmRpY2F0aW9uIG9mIGZpbHRlcmluZ1xuICAgICAgICAgICAgICAgICAgICAgKiB0aGVyZSdzIG5vIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCBPbGl2ZSBzaG91bGQgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UsIHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gcHJvY2VzcyBpdCBmb3Igbm93LCBmb3IgcmVkZWVtZWQgb2ZmZXJzIHB1cnBvc2VzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5wcm9jZXNzYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW52YWxpZCByZXF1ZXN0IG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlcXVlc3QgYm9keSBwYXNzZWQgaW4uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlcXVlc3QgYm9keSBpcyBudWxsLCByZXR1cm4gYSB2YWxpZGF0aW9uIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCByZXF1ZXN0IGJvZHkgcGFzc2VkIGluLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke3JvdXRlfSByZXF1ZXN0YDtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAqIE9saXZlIHdpbGwgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=