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
                    // build the transaction object from the incoming request body
                    const transaction = {
                        /**
                         * the transaction id, is represented by the userId of the associated Moonbeam user, to be obtained during processing
                         * through the GET member details call
                         */
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
                         * processing time, but it will all depend on the creation time of the transaction, which is why we only passed in the creation time of the transaction
                         * below.
                         */
                        timestamp: 0,
                        createdAt: requestData["transaction"]["created"],
                        rewardAmount: requestData["transaction"]["rewardAmount"],
                        totalAmount: requestData["transaction"]["amount"],
                        // we start with 0 dollars credited to the customer, since the whole reward amount is pending credit at transaction creation time
                        creditedCashbackAmount: 0,
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
                         * the message group id, will be represented by the Olive member id, so that we can group transaction messages for a particular member id,
                         * associated to a Moonbeam user id, and sort them in the FIFO processing topic accordingly.
                         */
                        MessageGroupId: transaction.memberId
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VUcmFuc2FjdGlvbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL0Fja25vd2xlZGdlVHJhbnNhY3Rpb25IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUFrSDtBQUNsSCxvREFBOEQ7QUFFOUQ7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBRSxXQUEwQixFQUFrQyxFQUFFO0lBQ3RILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0RBQW9EO1FBQ3BELElBQUksV0FBVyxFQUFFO1lBQ2Isd0RBQXdEO1lBQ3hELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRCxNQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUVqRix5R0FBeUc7WUFDekcsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXO2dCQUMxRSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUM7Z0JBQzlFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM3RSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDbkYsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEVBQUU7Z0JBRXBELCtFQUErRTtnQkFDL0UsSUFBSSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztvQkFDN0UsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQztvQkFDNUYsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUV2Qyw4REFBOEQ7b0JBQzlELE1BQU0sV0FBVyxHQUFnQjt3QkFDN0I7OzsyQkFHRzt3QkFDSCxRQUFRLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQzt3QkFDakMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7d0JBQzlDLE9BQU8sRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO3dCQUM5QyxNQUFNLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQzt3QkFDNUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQzt3QkFDNUQsWUFBWSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxjQUFjLENBQUM7d0JBQ3hELGFBQWEsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO3dCQUNwRCxrSkFBa0o7d0JBQ2xKLGlCQUFpQixFQUFFLG9DQUFrQixDQUFDLE9BQU87d0JBQzdDLHdKQUF3Sjt3QkFDeEosZUFBZSxFQUFFLGlDQUFlLENBQUMsYUFBYTt3QkFDOUM7Ozs7MkJBSUc7d0JBQ0gsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7d0JBQ2hELFlBQVksRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDO3dCQUN4RCxXQUFXLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQzt3QkFDakQsaUlBQWlJO3dCQUNqSSxzQkFBc0IsRUFBRSxDQUFDO3dCQUN6QixxQkFBcUIsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDO3FCQUNwRSxDQUFBO29CQUVELDhCQUE4QjtvQkFDOUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxzQkFBUyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7b0JBRWxEOzs7Ozs7dUJBTUc7b0JBQ0gsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBYyxDQUFDO3dCQUMvRCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBa0M7d0JBQ3hELE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQzt3QkFDcEM7OzsyQkFHRzt3QkFDSCxjQUFjLEVBQUUsV0FBVyxDQUFDLFFBQVE7cUJBQ3ZDLENBQUMsQ0FBQyxDQUFDO29CQUVKLDRGQUE0RjtvQkFDNUYsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxTQUFTLElBQUksa0JBQWtCLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDO3dCQUMvRixrQkFBa0IsQ0FBQyxjQUFjLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3JGOzs7MkJBR0c7d0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtRkFBbUYsa0JBQWtCLENBQUMsU0FBUyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7d0JBRXBLLE9BQU87NEJBQ0gsVUFBVSxFQUFFLEdBQUc7NEJBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0NBQ2pCLElBQUksRUFBRSwyQkFBMkI7NkJBQ3BDLENBQUM7eUJBQ0wsQ0FBQTtxQkFDSjt5QkFBTTt3QkFDSCxNQUFNLFlBQVksR0FBRyxpRUFBaUUsQ0FBQzt3QkFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFFMUI7OzsyQkFHRzt3QkFDSCxPQUFPOzRCQUNILFVBQVUsRUFBRSxHQUFHOzRCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dDQUNqQixJQUFJLEVBQUUsSUFBSTtnQ0FDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsYUFBYTtnQ0FDOUMsWUFBWSxFQUFFLFlBQVk7NkJBQzdCLENBQUM7eUJBQ0wsQ0FBQTtxQkFDSjtpQkFDSjtxQkFBTTtvQkFDSCxNQUFNLFlBQVksR0FBRyx3REFBd0QsQ0FBQztvQkFDOUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUU5Qzs7O3VCQUdHO29CQUNILE9BQU87d0JBQ0gsVUFBVSxFQUFFLEdBQUc7d0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7NEJBQ2pCLElBQUksRUFBRSxJQUFJOzRCQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxhQUFhOzRCQUM5QyxZQUFZLEVBQUUsWUFBWTt5QkFDN0IsQ0FBQztxQkFDTCxDQUFBO2lCQUNKO2FBQ0o7aUJBQU07Z0JBQ0gseUJBQXlCO2dCQUN6QixNQUFNLFlBQVksR0FBRyxpQ0FBaUMsQ0FBQztnQkFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUU5Qzs7O21CQUdHO2dCQUNILE9BQU87b0JBQ0gsVUFBVSxFQUFFLEdBQUc7b0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7d0JBQ2pCLElBQUksRUFBRSxJQUFJO3dCQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO3dCQUNoRCxZQUFZLEVBQUUsWUFBWTtxQkFDN0IsQ0FBQztpQkFDTCxDQUFBO2FBQ0o7U0FDSjthQUFNO1lBQ0gscUVBQXFFO1lBQ3JFLE1BQU0sWUFBWSxHQUFHLGlDQUFpQyxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQztZQUU5Qzs7O2VBR0c7WUFDSCxPQUFPO2dCQUNILFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixJQUFJLEVBQUUsSUFBSTtvQkFDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtvQkFDaEQsWUFBWSxFQUFFLFlBQVk7aUJBQzdCLENBQUM7YUFDTCxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osTUFBTSxZQUFZLEdBQUcscUNBQXFDLEtBQUssVUFBVSxDQUFDO1FBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUV4Qzs7O1dBR0c7UUFDSCxPQUFPO1lBQ0gsVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDakIsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7Z0JBQ2hELFlBQVksRUFBRSxZQUFZO2FBQzdCLENBQUM7U0FDTCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUFoTFksUUFBQSxzQkFBc0IsMEJBZ0xsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QVBJR2F0ZXdheVByb3h5UmVzdWx0fSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL2FwaS1nYXRld2F5LXByb3h5XCI7XG5pbXBvcnQge1RyYW5zYWN0aW9uLCBUcmFuc2FjdGlvbnNFcnJvclR5cGUsIFRyYW5zYWN0aW9uc1N0YXR1cywgVHJhbnNhY3Rpb25UeXBlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtQdWJsaXNoQ29tbWFuZCwgU05TQ2xpZW50fSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXNuc1wiO1xuXG4vKipcbiAqIEFja25vd2xlZGdlVHJhbnNhY3Rpb24gaGFuZGxlclxuICpcbiAqIEBwYXJhbSByb3V0ZSByZXF1ZXN0IHJvdXRlLCBjb21wb3NlZCBvZiBIVFRQIFZlcmIgYW5kIEhUVFAgUGF0aFxuICogQHBhcmFtIHJlcXVlc3RCb2R5IHJlcXVlc3QgYm9keSBpbnB1dCwgcGFzc2VkIGJ5IHRoZSBjYWxsZXIgdGhyb3VnaCB0aGUgQVBJIEdhdGV3YXkgZXZlbnRcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEFQSUdhdGV3YXlQcm94eVJlc3VsdH1cbiAqL1xuZXhwb3J0IGNvbnN0IGFja25vd2xlZGdlVHJhbnNhY3Rpb24gPSBhc3luYyAocm91dGU6IHN0cmluZywgcmVxdWVzdEJvZHk6IHN0cmluZyB8IG51bGwpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGZpcnN0IGNoZWNrIHdoZXRoZXIgd2UgaGF2ZSBhIHZhbGlkIHJlcXVlc3QgYm9keS5cbiAgICAgICAgaWYgKHJlcXVlc3RCb2R5KSB7XG4gICAgICAgICAgICAvLyBwYXJzZSB0aGUgaW5jb21pbmcgcmVxdWVzdCBib2R5IGRhdGEgYXMgYSBKU09OIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEJvZHlQYXJzZWQgPSBKU09OLnBhcnNlKHJlcXVlc3RCb2R5KTtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0gcmVxdWVzdEJvZHlQYXJzZWRbXCJkYXRhXCJdID8gcmVxdWVzdEJvZHlQYXJzZWRbXCJkYXRhXCJdIDogbnVsbDtcblxuICAgICAgICAgICAgLy8gcGVyZm9ybSBzb21lIHZhbGlkYXRpb25zIGJhc2VkIG9uIHdoYXQgaXMgZXhwZWN0ZWQgaW4gdGVybXMgb2YgdGhlIGluY29taW5nIGRhdGEgbW9kZWwgYW5kIGl0cyBtYXBwaW5nXG4gICAgICAgICAgICBpZiAocmVxdWVzdEJvZHlQYXJzZWRbXCJkYXRhXCJdICYmIHJlcXVlc3RCb2R5UGFyc2VkW1widGltZXN0YW1wXCJdICYmIHJlcXVlc3REYXRhICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJjYXJkSWRcIl0gJiYgcmVxdWVzdERhdGFbXCJtZW1iZXJJZFwiXSAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNhcmRJZFwiXSAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjdXJyZW5jeUNvZGVcIl0gJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNyZWF0ZWRcIl0gJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wibWVyY2hhbnRDYXRlZ29yeUNvZGVcIl0pIHtcblxuICAgICAgICAgICAgICAgIC8vIGZpbHRlciBiYXNlZCBvbiB3aGV0aGVyIGFuIGluY29taW5nIHRyYW5zYWN0aW9uIGlzIGEgcmVkZWVtYWJsZSBvZmZlciBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImFtb3VudFwiXSAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYnJhbmRJZFwiXSAmJlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wibG95YWx0eVByb2dyYW1JZFwiXSAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wicmV3YXJkQW1vdW50XCJdICYmXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJzdG9yZUlkXCJdKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGQgdGhlIHRyYW5zYWN0aW9uIG9iamVjdCBmcm9tIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGUgdHJhbnNhY3Rpb24gaWQsIGlzIHJlcHJlc2VudGVkIGJ5IHRoZSB1c2VySWQgb2YgdGhlIGFzc29jaWF0ZWQgTW9vbmJlYW0gdXNlciwgdG8gYmUgb2J0YWluZWQgZHVyaW5nIHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRocm91Z2ggdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiByZXF1ZXN0RGF0YVtcIm1lbWJlcklkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJZDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInN0b3JlSWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuZElkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYnJhbmRJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNhcmRJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wibWVyY2hhbnRDYXRlZ29yeUNvZGVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGU6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjdXJyZW5jeUNvZGVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgc3RhdHVzIG9mIGFsbCBpbmNvbWluZyB0cmFuc2FjdGlvbnMgdG8gYmUgcGVuZGluZywgdW50aWwgd2UgZ2V0IGEgc3RhdHVzIGNoYW5nZSBhbmQvb3IgdW50aWwgdGhlIGNhc2hiYWNrIGlzIHJlaW1idXJzZWQgdG8gdGhlIGN1c3RvbWVyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czogVHJhbnNhY3Rpb25zU3RhdHVzLlBlbmRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdHlwZSBvZiB0aGlzIHRyYW5zYWN0aW9uIHdpbGwgYmUgYW4gb2ZmZXIgcmVkZWVtZWQgdHlwZSBmb3Igbm93LiBJbiB0aGUgZnV0dXJlIHdoZW4gd2UgcHJvY2VzcyBkaWZmZXJlbnQgdHlwZXMgb2YgdHJhbnNhY3Rpb25zLCB0aGlzIG1pZ2h0IGNoYW5nZVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlOiBUcmFuc2FjdGlvblR5cGUuT2ZmZXJSZWRlZW1lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogYXQgY3JlYXRpb24gdGltZSwgdGhlc2UgdGltZXN0YW1wcyB3b24ndCBiZSBjb252ZXJ0ZWQgYXBwcm9wcmlhdGVseSwgdG8gd2hhdCB3ZSBleHBlY3QgdGhlbSB0byBsb29rIGxpa2UuIFRoYXQgY29udmVyc2lvbiB3aWxsIGJlIGRvbmUgYWxsIGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBwcm9jZXNzaW5nIHRpbWUsIGJ1dCBpdCB3aWxsIGFsbCBkZXBlbmQgb24gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHRyYW5zYWN0aW9uLCB3aGljaCBpcyB3aHkgd2Ugb25seSBwYXNzZWQgaW4gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBiZWxvdy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInJld2FyZEFtb3VudFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYW1vdW50XCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Ugc3RhcnQgd2l0aCAwIGRvbGxhcnMgY3JlZGl0ZWQgdG8gdGhlIGN1c3RvbWVyLCBzaW5jZSB0aGUgd2hvbGUgcmV3YXJkIGFtb3VudCBpcyBwZW5kaW5nIGNyZWRpdCBhdCB0cmFuc2FjdGlvbiBjcmVhdGlvbiB0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wicmV3YXJkQW1vdW50XCJdXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIFNOUyBDbGllbnRcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc25zQ2xpZW50ID0gbmV3IFNOU0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogZHJvcCB0aGUgdHJhbnNhY3Rpb24gYXMgYSBtZXNzYWdlIHRvIHRoZSB0cmFuc2FjdGlvbnMgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBub3RlOiBpbiB0aGUgZnV0dXJlIHdoZW4gd2Ugd2lsbCBoYXZlIG90aGVyIHR5cGVzIG9mIHRyYW5zYWN0aW9ucywgb3RoZXIgdGhhbiBvZmZlciBiYXNlZCBvbmVzLCB3ZSB3aWxsIG5lZWQgdG8gYWRkIGEgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAqIHRocm91Z2ggdGhlIG1lc3NhZ2UgYXR0cmlidXRlcyBvZiB0aGUgdG9waWMsIHNvIHRoYXQgb25seSBtZXNzYWdlcyB3aXRoIHNwZWNpZmljIGZpbHRlcnMgZ2V0IGRyb3BwZWQgdG8gYSBwYXJ0aWN1bGFyIHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgICogcXVldWUuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvblJlY2VpcHQgPSBhd2FpdCBzbnNDbGllbnQuc2VuZChuZXcgUHVibGlzaENvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgVG9waWNBcm46IHByb2Nlc3MuZW52LlRSQU5TQUNUSU9OU19QUk9DRVNTSU5HX1RPUElDX0FSTiEsXG4gICAgICAgICAgICAgICAgICAgICAgICBNZXNzYWdlOiBKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSBtZXNzYWdlIGdyb3VwIGlkLCB3aWxsIGJlIHJlcHJlc2VudGVkIGJ5IHRoZSBPbGl2ZSBtZW1iZXIgaWQsIHNvIHRoYXQgd2UgY2FuIGdyb3VwIHRyYW5zYWN0aW9uIG1lc3NhZ2VzIGZvciBhIHBhcnRpY3VsYXIgbWVtYmVyIGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICogYXNzb2NpYXRlZCB0byBhIE1vb25iZWFtIHVzZXIgaWQsIGFuZCBzb3J0IHRoZW0gaW4gdGhlIEZJRk8gcHJvY2Vzc2luZyB0b3BpYyBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgTWVzc2FnZUdyb3VwSWQ6IHRyYW5zYWN0aW9uLm1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgdHJhbnNhY3Rpb24gbWVzc2FnZSB3YXMgcHJvcGVybHkgc2VudCB0byB0aGUgYXBwcm9wcmlhdGUgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNhY3Rpb25SZWNlaXB0ICYmIHRyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWQgJiYgdHJhbnNhY3Rpb25SZWNlaXB0Lk1lc3NhZ2VJZC5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uUmVjZWlwdC5TZXF1ZW5jZU51bWJlciAmJiB0cmFuc2FjdGlvblJlY2VpcHQuU2VxdWVuY2VOdW1iZXIubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSB0cmFuc2FjdGlvbiBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgZHJvcHBlZCBpbnRvIHRoZSB0b3BpYywgYW5kIHdpbGwgYmUgcGlja2VkIHVwIGJ5IHRoZSB0cmFuc2FjdGlvbnMgY29uc3VtZXIgYW5kIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBzZXJ2aWNlcywgbGlrZSB0aGUgbm90aWZpY2F0aW9ucyBzZXJ2aWNlIGNvbnN1bWVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVHJhbnNhY3Rpb24gc3VjY2Vzc2Z1bGx5IHNlbnQgdG8gdG9waWMgZm9yIHByb2Nlc3Npbmcgd2l0aCByZWNlaXB0IGluZm9ybWF0aW9uOiAke3RyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWR9ICR7dHJhbnNhY3Rpb25SZWNlaXB0LlNlcXVlbmNlTnVtYmVyfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGBUcmFuc2FjdGlvbiBhY2tub3dsZWRnZWQhYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZW5kaW5nIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlIGZ1cnRoZXIhYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggc2VuZGluZyB0aGUgbWVzc2FnZSB0byB0aGUgdG9waWMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5wcm9jZXNzYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFRyYW5zYWN0aW9uIGlzIG5vdCBhIHJlZGVlbWFibGUgb2ZmZXIuIE5vdCBwcm9jZXNzaW5nLmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXF1ZXN0Qm9keX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogcmV0dXJuIGEgMnh4IHJlc3BvbnNlIGhlcmUsIHNpbmNlIHRoaXMgaXMgbm90IGEgdHJ1ZSBlcnJvciB3b3J0aCByZXRyeWluZyB0aGUgcHJvY2Vzc2luZywgYnV0IHJhdGhlciBhbiBpbmRpY2F0aW9uIG9mIGZpbHRlcmluZ1xuICAgICAgICAgICAgICAgICAgICAgKiB0aGVyZSdzIG5vIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCBPbGl2ZSBzaG91bGQgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UsIHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gcHJvY2VzcyBpdCBmb3Igbm93LCBmb3IgcmVkZWVtZWQgb2ZmZXJzIHB1cnBvc2VzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5wcm9jZXNzYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW52YWxpZCByZXF1ZXN0IG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlcXVlc3QgYm9keSBwYXNzZWQgaW4uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlcXVlc3QgYm9keSBpcyBudWxsLCByZXR1cm4gYSB2YWxpZGF0aW9uIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCByZXF1ZXN0IGJvZHkgcGFzc2VkIGluLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke3JvdXRlfSByZXF1ZXN0YDtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAqIE9saXZlIHdpbGwgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=