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
        if (requestBody !== undefined && requestBody !== null && requestBody.length !== 0) {
            // parse the incoming request body data as a JSON object
            const requestBodyParsed = JSON.parse(requestBody);
            const requestData = requestBodyParsed["data"] ? requestBodyParsed["data"] : null;
            // perform some validations based on what is expected in terms of the incoming data model and its mapping
            if (requestBodyParsed["data"] !== undefined && requestBodyParsed["data"] !== null &&
                requestBodyParsed["timestamp"] !== undefined && requestBodyParsed["timestamp"] !== undefined !== null &&
                requestData !== undefined && requestData !== null &&
                requestData["cardId"] !== undefined && requestData["cardId"] !== null &&
                requestData["memberId"] !== undefined && requestData["memberId"] !== null &&
                requestData["transaction"] !== undefined && requestData["transaction"] !== null &&
                requestData["transaction"]["id"] !== undefined && requestData["transaction"]["id"] !== null &&
                requestData["transaction"]["cardId"] !== undefined && requestData["transaction"]["cardId"] !== null &&
                requestData["transaction"]["created"] !== undefined && requestData["transaction"]["created"] !== null &&
                requestData["transaction"]["currencyCode"] !== undefined && requestData["transaction"]["currencyCode"] !== null &&
                requestData["transaction"]["created"] !== undefined && requestData["transaction"]["created"] !== null &&
                requestData["transaction"]["merchantCategoryCode"] !== undefined && requestData["transaction"]["merchantCategoryCode"] !== null) {
                // filter based on whether an incoming transaction is a redeemable offer or not
                if (requestData["transaction"]["amount"] !== undefined && requestData["transaction"]["amount"] !== null &&
                    requestData["transaction"]["brandId"] !== undefined && requestData["transaction"]["brandId"] !== null &&
                    requestData["transaction"]["loyaltyProgramId"] !== undefined && requestData["transaction"]["loyaltyProgramId"] !== null &&
                    requestData["transaction"]["rewardAmount"] !== undefined && requestData["transaction"]["rewardAmount"] !== null &&
                    requestData["transaction"]["storeId"] !== undefined && requestData["transaction"]["storeId"] !== null) {
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
                        transactionId: requestData["transaction"]["id"],
                        /**
                         * set the status of all incoming transactions:
                         * - to PENDING if there is no status passed in the ["transaction"]["moonbeamTransactionStatus"] parameter, since then we know that this
                         * got invoked directly by Olive on card swipe, or by our update transactions workflow, when an ineligible transaction became an eligible offer.
                         * - if the updated transaction workflow passes a status in the ["transaction"]["moonbeamTransactionStatus"], pass that accordingly.
                         *
                         * Note: any other statuses such as (PROCESSED, CREDITED or REJECTED) will be updated by the updated transaction workflow accordingly, by
                         * directly calling our AppSync transaction endpoints, instead of going through this flow.
                         */
                        transactionStatus: requestData["transaction"]["moonbeamTransactionStatus"]
                            ? requestData["transaction"]["moonbeamTransactionStatus"]
                            : moonbeam_models_1.TransactionsStatus.Pending,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VUcmFuc2FjdGlvbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL0Fja25vd2xlZGdlVHJhbnNhY3Rpb25IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUFrSDtBQUNsSCxvREFBOEQ7QUFFOUQ7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBRSxXQUEwQixFQUFrQyxFQUFFO0lBQ3RILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0RBQW9EO1FBQ3BELElBQUksV0FBVyxLQUFLLFNBQVMsSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9FLHdEQUF3RDtZQUN4RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEQsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFakYseUdBQXlHO1lBQ3pHLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUk7Z0JBQzdFLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsS0FBSyxTQUFTLEtBQUssSUFBSTtnQkFDckcsV0FBVyxLQUFLLFNBQVMsSUFBSSxXQUFXLEtBQUssSUFBSTtnQkFDakQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFD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d2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7VHJhbnNhY3Rpb24sIFRyYW5zYWN0aW9uc0Vycm9yVHlwZSwgVHJhbnNhY3Rpb25zU3RhdHVzLCBUcmFuc2FjdGlvblR5cGV9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1B1Ymxpc2hDb21tYW5kLCBTTlNDbGllbnR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtc25zXCI7XG5cbi8qKlxuICogQWNrbm93bGVkZ2VUcmFuc2FjdGlvbiBoYW5kbGVyXG4gKlxuICogQHBhcmFtIHJvdXRlIHJlcXVlc3Qgcm91dGUsIGNvbXBvc2VkIG9mIEhUVFAgVmVyYiBhbmQgSFRUUCBQYXRoXG4gKiBAcGFyYW0gcmVxdWVzdEJvZHkgcmVxdWVzdCBib2R5IGlucHV0LCBwYXNzZWQgYnkgdGhlIGNhbGxlciB0aHJvdWdoIHRoZSBBUEkgR2F0ZXdheSBldmVudFxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQVBJR2F0ZXdheVByb3h5UmVzdWx0fVxuICovXG5leHBvcnQgY29uc3QgYWNrbm93bGVkZ2VUcmFuc2FjdGlvbiA9IGFzeW5jIChyb3V0ZTogc3RyaW5nLCByZXF1ZXN0Qm9keTogc3RyaW5nIHwgbnVsbCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gZmlyc3QgY2hlY2sgd2hldGhlciB3ZSBoYXZlIGEgdmFsaWQgcmVxdWVzdCBib2R5LlxuICAgICAgICBpZiAocmVxdWVzdEJvZHkgIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keSAhPT0gbnVsbCAmJiByZXF1ZXN0Qm9keS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIHBhcnNlIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHkgZGF0YSBhcyBhIEpTT04gb2JqZWN0XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0Qm9keVBhcnNlZCA9IEpTT04ucGFyc2UocmVxdWVzdEJvZHkpO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gPyByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gOiBudWxsO1xuXG4gICAgICAgICAgICAvLyBwZXJmb3JtIHNvbWUgdmFsaWRhdGlvbnMgYmFzZWQgb24gd2hhdCBpcyBleHBlY3RlZCBpbiB0ZXJtcyBvZiB0aGUgaW5jb21pbmcgZGF0YSBtb2RlbCBhbmQgaXRzIG1hcHBpbmdcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keVBhcnNlZFtcInRpbWVzdGFtcFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3RCb2R5UGFyc2VkW1widGltZXN0YW1wXCJdICE9PSB1bmRlZmluZWQgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJjYXJkSWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcImNhcmRJZFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1wibWVtYmVySWRcIl0gIT09dW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1wibWVtYmVySWRcIl0gIT09bnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImlkXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImlkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNhcmRJZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjYXJkSWRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjcmVhdGVkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImN1cnJlbmN5Q29kZVwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjdXJyZW5jeUNvZGVcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjcmVhdGVkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcIm1lcmNoYW50Q2F0ZWdvcnlDb2RlXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcIm1lcmNoYW50Q2F0ZWdvcnlDb2RlXCJdICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgYmFzZWQgb24gd2hldGhlciBhbiBpbmNvbWluZyB0cmFuc2FjdGlvbiBpcyBhIHJlZGVlbWFibGUgb2ZmZXIgb3Igbm90XG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJhbW91bnRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYW1vdW50XCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJicmFuZElkXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImJyYW5kSWRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImxveWFsdHlQcm9ncmFtSWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wibG95YWx0eVByb2dyYW1JZFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wicmV3YXJkQW1vdW50XCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInJld2FyZEFtb3VudFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wic3RvcmVJZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJzdG9yZUlkXCJdICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGQgdGhlIHRyYW5zYWN0aW9uIG9iamVjdCBmcm9tIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGUgdHJhbnNhY3Rpb24gaWQsIGlzIHJlcHJlc2VudGVkIGJ5IHRoZSB1c2VySWQgb2YgdGhlIGFzc29jaWF0ZWQgTW9vbmJlYW0gdXNlciwgdG8gYmUgb2J0YWluZWQgZHVyaW5nIHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRocm91Z2ggdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiByZXF1ZXN0RGF0YVtcIm1lbWJlcklkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJZDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInN0b3JlSWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuZElkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYnJhbmRJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNhcmRJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wibWVyY2hhbnRDYXRlZ29yeUNvZGVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGU6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjdXJyZW5jeUNvZGVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiaWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHNldCB0aGUgc3RhdHVzIG9mIGFsbCBpbmNvbWluZyB0cmFuc2FjdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgKiAtIHRvIFBFTkRJTkcgaWYgdGhlcmUgaXMgbm8gc3RhdHVzIHBhc3NlZCBpbiB0aGUgW1widHJhbnNhY3Rpb25cIl1bXCJtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzXCJdIHBhcmFtZXRlciwgc2luY2UgdGhlbiB3ZSBrbm93IHRoYXQgdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICogZ290IGludm9rZWQgZGlyZWN0bHkgYnkgT2xpdmUgb24gY2FyZCBzd2lwZSwgb3IgYnkgb3VyIHVwZGF0ZSB0cmFuc2FjdGlvbnMgd29ya2Zsb3csIHdoZW4gYW4gaW5lbGlnaWJsZSB0cmFuc2FjdGlvbiBiZWNhbWUgYW4gZWxpZ2libGUgb2ZmZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiAtIGlmIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIHdvcmtmbG93IHBhc3NlcyBhIHN0YXR1cyBpbiB0aGUgW1widHJhbnNhY3Rpb25cIl1bXCJtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzXCJdLCBwYXNzIHRoYXQgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogTm90ZTogYW55IG90aGVyIHN0YXR1c2VzIHN1Y2ggYXMgKFBST0NFU1NFRCwgQ1JFRElURUQgb3IgUkVKRUNURUQpIHdpbGwgYmUgdXBkYXRlZCBieSB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiB3b3JrZmxvdyBhY2NvcmRpbmdseSwgYnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGRpcmVjdGx5IGNhbGxpbmcgb3VyIEFwcFN5bmMgdHJhbnNhY3Rpb24gZW5kcG9pbnRzLCBpbnN0ZWFkIG9mIGdvaW5nIHRocm91Z2ggdGhpcyBmbG93LlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcIm1vb25iZWFtVHJhbnNhY3Rpb25TdGF0dXNcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzXCJdIGFzIFRyYW5zYWN0aW9uc1N0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogVHJhbnNhY3Rpb25zU3RhdHVzLlBlbmRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdHlwZSBvZiB0aGlzIHRyYW5zYWN0aW9uIHdpbGwgYmUgYW4gb2ZmZXIgcmVkZWVtZWQgdHlwZSBmb3Igbm93LiBJbiB0aGUgZnV0dXJlIHdoZW4gd2UgcHJvY2VzcyBkaWZmZXJlbnQgdHlwZXMgb2YgdHJhbnNhY3Rpb25zLCB0aGlzIG1pZ2h0IGNoYW5nZVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlOiBUcmFuc2FjdGlvblR5cGUuT2ZmZXJSZWRlZW1lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogYXQgY3JlYXRpb24gdGltZSwgdGhlc2UgdGltZXN0YW1wcyB3b24ndCBiZSBjb252ZXJ0ZWQgYXBwcm9wcmlhdGVseSwgdG8gd2hhdCB3ZSBleHBlY3QgdGhlbSB0byBsb29rIGxpa2UuIFRoYXQgY29udmVyc2lvbiB3aWxsIGJlIGRvbmUgYWxsIGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBwcm9jZXNzaW5nIHRpbWUsIGJ1dCBpdCB3aWxsIGFsbCBkZXBlbmQgb24gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHRyYW5zYWN0aW9uLCB3aGljaCBpcyB3aHkgd2Ugb25seSBwYXNzZWQgaW4gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBiZWxvdy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInJld2FyZEFtb3VudFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYW1vdW50XCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Ugc3RhcnQgd2l0aCAwIGRvbGxhcnMgY3JlZGl0ZWQgdG8gdGhlIGN1c3RvbWVyLCBzaW5jZSB0aGUgd2hvbGUgcmV3YXJkIGFtb3VudCBpcyBwZW5kaW5nIGNyZWRpdCBhdCB0cmFuc2FjdGlvbiBjcmVhdGlvbiB0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wicmV3YXJkQW1vdW50XCJdXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIFNOUyBDbGllbnRcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc25zQ2xpZW50ID0gbmV3IFNOU0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogZHJvcCB0aGUgdHJhbnNhY3Rpb24gYXMgYSBtZXNzYWdlIHRvIHRoZSB0cmFuc2FjdGlvbnMgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBub3RlOiBpbiB0aGUgZnV0dXJlIHdoZW4gd2Ugd2lsbCBoYXZlIG90aGVyIHR5cGVzIG9mIHRyYW5zYWN0aW9ucywgb3RoZXIgdGhhbiBvZmZlciBiYXNlZCBvbmVzLCB3ZSB3aWxsIG5lZWQgdG8gYWRkIGEgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAqIHRocm91Z2ggdGhlIG1lc3NhZ2UgYXR0cmlidXRlcyBvZiB0aGUgdG9waWMsIHNvIHRoYXQgb25seSBtZXNzYWdlcyB3aXRoIHNwZWNpZmljIGZpbHRlcnMgZ2V0IGRyb3BwZWQgdG8gYSBwYXJ0aWN1bGFyIHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgICogcXVldWUuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvblJlY2VpcHQgPSBhd2FpdCBzbnNDbGllbnQuc2VuZChuZXcgUHVibGlzaENvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgVG9waWNBcm46IHByb2Nlc3MuZW52LlRSQU5TQUNUSU9OU19QUk9DRVNTSU5HX1RPUElDX0FSTiEsXG4gICAgICAgICAgICAgICAgICAgICAgICBNZXNzYWdlOiBKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSBtZXNzYWdlIGdyb3VwIGlkLCB3aWxsIGJlIHJlcHJlc2VudGVkIGJ5IHRoZSBPbGl2ZSBtZW1iZXIgaWQsIHNvIHRoYXQgd2UgY2FuIGdyb3VwIHRyYW5zYWN0aW9uIG1lc3NhZ2VzIGZvciBhIHBhcnRpY3VsYXIgbWVtYmVyIGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICogYXNzb2NpYXRlZCB0byBhIE1vb25iZWFtIHVzZXIgaWQsIGFuZCBzb3J0IHRoZW0gaW4gdGhlIEZJRk8gcHJvY2Vzc2luZyB0b3BpYyBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgTWVzc2FnZUdyb3VwSWQ6IHRyYW5zYWN0aW9uLm1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgdHJhbnNhY3Rpb24gbWVzc2FnZSB3YXMgcHJvcGVybHkgc2VudCB0byB0aGUgYXBwcm9wcmlhdGUgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNhY3Rpb25SZWNlaXB0ICYmIHRyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWQgJiYgdHJhbnNhY3Rpb25SZWNlaXB0Lk1lc3NhZ2VJZC5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uUmVjZWlwdC5TZXF1ZW5jZU51bWJlciAmJiB0cmFuc2FjdGlvblJlY2VpcHQuU2VxdWVuY2VOdW1iZXIubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSB0cmFuc2FjdGlvbiBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgZHJvcHBlZCBpbnRvIHRoZSB0b3BpYywgYW5kIHdpbGwgYmUgcGlja2VkIHVwIGJ5IHRoZSB0cmFuc2FjdGlvbnMgY29uc3VtZXIgYW5kIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBzZXJ2aWNlcywgbGlrZSB0aGUgbm90aWZpY2F0aW9ucyBzZXJ2aWNlIGNvbnN1bWVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVHJhbnNhY3Rpb24gc3VjY2Vzc2Z1bGx5IHNlbnQgdG8gdG9waWMgZm9yIHByb2Nlc3Npbmcgd2l0aCByZWNlaXB0IGluZm9ybWF0aW9uOiAke3RyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWR9ICR7dHJhbnNhY3Rpb25SZWNlaXB0LlNlcXVlbmNlTnVtYmVyfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGBUcmFuc2FjdGlvbiBhY2tub3dsZWRnZWQhYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZW5kaW5nIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlIGZ1cnRoZXIhYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggc2VuZGluZyB0aGUgbWVzc2FnZSB0byB0aGUgdG9waWMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5wcm9jZXNzYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFRyYW5zYWN0aW9uIGlzIG5vdCBhIHJlZGVlbWFibGUgb2ZmZXIuIE5vdCBwcm9jZXNzaW5nLmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXF1ZXN0Qm9keX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogcmV0dXJuIGEgMnh4IHJlc3BvbnNlIGhlcmUsIHNpbmNlIHRoaXMgaXMgbm90IGEgdHJ1ZSBlcnJvciB3b3J0aCByZXRyeWluZyB0aGUgcHJvY2Vzc2luZywgYnV0IHJhdGhlciBhbiBpbmRpY2F0aW9uIG9mIGZpbHRlcmluZ1xuICAgICAgICAgICAgICAgICAgICAgKiB0aGVyZSdzIG5vIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCBPbGl2ZSBzaG91bGQgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UsIHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gcHJvY2VzcyBpdCBmb3Igbm93LCBmb3IgcmVkZWVtZWQgb2ZmZXJzIHB1cnBvc2VzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5wcm9jZXNzYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW52YWxpZCByZXF1ZXN0IG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlcXVlc3QgYm9keSBwYXNzZWQgaW4uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlcXVlc3QgYm9keSBpcyBudWxsLCByZXR1cm4gYSB2YWxpZGF0aW9uIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCByZXF1ZXN0IGJvZHkgcGFzc2VkIGluLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke3JvdXRlfSByZXF1ZXN0YDtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAqIE9saXZlIHdpbGwgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=