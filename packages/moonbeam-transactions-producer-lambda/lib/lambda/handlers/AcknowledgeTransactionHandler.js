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
                         * - if the updated transaction workflow passes a status in the ["transaction"]["moonbeamTransactionStatus"] , pass that accordingly.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VUcmFuc2FjdGlvbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL0Fja25vd2xlZGdlVHJhbnNhY3Rpb25IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUFrSDtBQUNsSCxvREFBOEQ7QUFFOUQ7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBRSxXQUEwQixFQUFrQyxFQUFFO0lBQ3RILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0RBQW9EO1FBQ3BELElBQUksV0FBVyxLQUFLLFNBQVMsSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9FLHdEQUF3RDtZQUN4RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEQsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFakYseUdBQXlHO1lBQ3pHLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUk7Z0JBQzdFLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsS0FBSyxTQUFTLEtBQUssSUFBSTtnQkFDckcsV0FBVyxLQUFLLFNBQVMsSUFBSSxXQUFXLEtBQUssSUFBSTtnQkFDakQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFD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d2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7VHJhbnNhY3Rpb24sIFRyYW5zYWN0aW9uc0Vycm9yVHlwZSwgVHJhbnNhY3Rpb25zU3RhdHVzLCBUcmFuc2FjdGlvblR5cGV9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1B1Ymxpc2hDb21tYW5kLCBTTlNDbGllbnR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtc25zXCI7XG5cbi8qKlxuICogQWNrbm93bGVkZ2VUcmFuc2FjdGlvbiBoYW5kbGVyXG4gKlxuICogQHBhcmFtIHJvdXRlIHJlcXVlc3Qgcm91dGUsIGNvbXBvc2VkIG9mIEhUVFAgVmVyYiBhbmQgSFRUUCBQYXRoXG4gKiBAcGFyYW0gcmVxdWVzdEJvZHkgcmVxdWVzdCBib2R5IGlucHV0LCBwYXNzZWQgYnkgdGhlIGNhbGxlciB0aHJvdWdoIHRoZSBBUEkgR2F0ZXdheSBldmVudFxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQVBJR2F0ZXdheVByb3h5UmVzdWx0fVxuICovXG5leHBvcnQgY29uc3QgYWNrbm93bGVkZ2VUcmFuc2FjdGlvbiA9IGFzeW5jIChyb3V0ZTogc3RyaW5nLCByZXF1ZXN0Qm9keTogc3RyaW5nIHwgbnVsbCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gZmlyc3QgY2hlY2sgd2hldGhlciB3ZSBoYXZlIGEgdmFsaWQgcmVxdWVzdCBib2R5LlxuICAgICAgICBpZiAocmVxdWVzdEJvZHkgIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keSAhPT0gbnVsbCAmJiByZXF1ZXN0Qm9keS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIHBhcnNlIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHkgZGF0YSBhcyBhIEpTT04gb2JqZWN0XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0Qm9keVBhcnNlZCA9IEpTT04ucGFyc2UocmVxdWVzdEJvZHkpO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gPyByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gOiBudWxsO1xuXG4gICAgICAgICAgICAvLyBwZXJmb3JtIHNvbWUgdmFsaWRhdGlvbnMgYmFzZWQgb24gd2hhdCBpcyBleHBlY3RlZCBpbiB0ZXJtcyBvZiB0aGUgaW5jb21pbmcgZGF0YSBtb2RlbCBhbmQgaXRzIG1hcHBpbmdcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keVBhcnNlZFtcInRpbWVzdGFtcFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3RCb2R5UGFyc2VkW1widGltZXN0YW1wXCJdICE9PSB1bmRlZmluZWQgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJjYXJkSWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcImNhcmRJZFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1wibWVtYmVySWRcIl0gIT09dW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1wibWVtYmVySWRcIl0gIT09bnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImlkXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImlkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNhcmRJZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjYXJkSWRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjcmVhdGVkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImN1cnJlbmN5Q29kZVwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjdXJyZW5jeUNvZGVcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjcmVhdGVkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcIm1lcmNoYW50Q2F0ZWdvcnlDb2RlXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcIm1lcmNoYW50Q2F0ZWdvcnlDb2RlXCJdICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgYmFzZWQgb24gd2hldGhlciBhbiBpbmNvbWluZyB0cmFuc2FjdGlvbiBpcyBhIHJlZGVlbWFibGUgb2ZmZXIgb3Igbm90XG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJhbW91bnRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYW1vdW50XCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJicmFuZElkXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImJyYW5kSWRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImxveWFsdHlQcm9ncmFtSWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wibG95YWx0eVByb2dyYW1JZFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wicmV3YXJkQW1vdW50XCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInJld2FyZEFtb3VudFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wic3RvcmVJZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJzdG9yZUlkXCJdICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGQgdGhlIHRyYW5zYWN0aW9uIG9iamVjdCBmcm9tIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGUgdHJhbnNhY3Rpb24gaWQsIGlzIHJlcHJlc2VudGVkIGJ5IHRoZSB1c2VySWQgb2YgdGhlIGFzc29jaWF0ZWQgTW9vbmJlYW0gdXNlciwgdG8gYmUgb2J0YWluZWQgZHVyaW5nIHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRocm91Z2ggdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiByZXF1ZXN0RGF0YVtcIm1lbWJlcklkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJZDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInN0b3JlSWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuZElkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYnJhbmRJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNhcmRJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wibWVyY2hhbnRDYXRlZ29yeUNvZGVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGU6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjdXJyZW5jeUNvZGVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiaWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHNldCB0aGUgc3RhdHVzIG9mIGFsbCBpbmNvbWluZyB0cmFuc2FjdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgKiAtIHRvIFBFTkRJTkcgaWYgdGhlcmUgaXMgbm8gc3RhdHVzIHBhc3NlZCBpbiB0aGUgW1widHJhbnNhY3Rpb25cIl1bXCJtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzXCJdIHBhcmFtZXRlciwgc2luY2UgdGhlbiB3ZSBrbm93IHRoYXQgdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICogZ290IGludm9rZWQgZGlyZWN0bHkgYnkgT2xpdmUgb24gY2FyZCBzd2lwZSwgb3IgYnkgb3VyIHVwZGF0ZSB0cmFuc2FjdGlvbnMgd29ya2Zsb3csIHdoZW4gYW4gaW5lbGlnaWJsZSB0cmFuc2FjdGlvbiBiZWNhbWUgYW4gZWxpZ2libGUgb2ZmZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiAtIGlmIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIHdvcmtmbG93IHBhc3NlcyBhIHN0YXR1cyBpbiB0aGUgW1widHJhbnNhY3Rpb25cIl1bXCJtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzXCJdICwgcGFzcyB0aGF0IGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIE5vdGU6IGFueSBvdGhlciBzdGF0dXNlcyBzdWNoIGFzIChQUk9DRVNTRUQsIENSRURJVEVEIG9yIFJFSkVDVEVEKSB3aWxsIGJlIHVwZGF0ZWQgYnkgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gd29ya2Zsb3cgYWNjb3JkaW5nbHksIGJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBkaXJlY3RseSBjYWxsaW5nIG91ciBBcHBTeW5jIHRyYW5zYWN0aW9uIGVuZHBvaW50cywgaW5zdGVhZCBvZiBnb2luZyB0aHJvdWdoIHRoaXMgZmxvdy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXM6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzXCJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wibW9vbmJlYW1UcmFuc2FjdGlvblN0YXR1c1wiXSBhcyBUcmFuc2FjdGlvbnNTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFRyYW5zYWN0aW9uc1N0YXR1cy5QZW5kaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHR5cGUgb2YgdGhpcyB0cmFuc2FjdGlvbiB3aWxsIGJlIGFuIG9mZmVyIHJlZGVlbWVkIHR5cGUgZm9yIG5vdy4gSW4gdGhlIGZ1dHVyZSB3aGVuIHdlIHByb2Nlc3MgZGlmZmVyZW50IHR5cGVzIG9mIHRyYW5zYWN0aW9ucywgdGhpcyBtaWdodCBjaGFuZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZTogVHJhbnNhY3Rpb25UeXBlLk9mZmVyUmVkZWVtZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGF0IGNyZWF0aW9uIHRpbWUsIHRoZXNlIHRpbWVzdGFtcHMgd29uJ3QgYmUgY29udmVydGVkIGFwcHJvcHJpYXRlbHksIHRvIHdoYXQgd2UgZXhwZWN0IHRoZW0gdG8gbG9vayBsaWtlLiBUaGF0IGNvbnZlcnNpb24gd2lsbCBiZSBkb25lIGFsbCBhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICogcHJvY2Vzc2luZyB0aW1lLCBidXQgaXQgd2lsbCBhbGwgZGVwZW5kIG9uIHRoZSBjcmVhdGlvbiB0aW1lIG9mIHRoZSB0cmFuc2FjdGlvbiwgd2hpY2ggaXMgd2h5IHdlIG9ubHkgcGFzc2VkIGluIHRoZSBjcmVhdGlvbiB0aW1lIG9mIHRoZSB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICogYmVsb3cuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNyZWF0ZWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnQ6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJyZXdhcmRBbW91bnRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbEFtb3VudDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImFtb3VudFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIHN0YXJ0IHdpdGggMCBkb2xsYXJzIGNyZWRpdGVkIHRvIHRoZSBjdXN0b21lciwgc2luY2UgdGhlIHdob2xlIHJld2FyZCBhbW91bnQgaXMgcGVuZGluZyBjcmVkaXQgYXQgdHJhbnNhY3Rpb24gY3JlYXRpb24gdGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInJld2FyZEFtb3VudFwiXVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBTTlMgQ2xpZW50XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNuc0NsaWVudCA9IG5ldyBTTlNDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIGRyb3AgdGhlIHRyYW5zYWN0aW9uIGFzIGEgbWVzc2FnZSB0byB0aGUgdHJhbnNhY3Rpb25zIHByb2Nlc3NpbmcgdG9waWNcbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogbm90ZTogaW4gdGhlIGZ1dHVyZSB3aGVuIHdlIHdpbGwgaGF2ZSBvdGhlciB0eXBlcyBvZiB0cmFuc2FjdGlvbnMsIG90aGVyIHRoYW4gb2ZmZXIgYmFzZWQgb25lcywgd2Ugd2lsbCBuZWVkIHRvIGFkZCBhIGZpbHRlclxuICAgICAgICAgICAgICAgICAgICAgKiB0aHJvdWdoIHRoZSBtZXNzYWdlIGF0dHJpYnV0ZXMgb2YgdGhlIHRvcGljLCBzbyB0aGF0IG9ubHkgbWVzc2FnZXMgd2l0aCBzcGVjaWZpYyBmaWx0ZXJzIGdldCBkcm9wcGVkIHRvIGEgcGFydGljdWxhciBwcm9jZXNzaW5nXG4gICAgICAgICAgICAgICAgICAgICAqIHF1ZXVlLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25SZWNlaXB0ID0gYXdhaXQgc25zQ2xpZW50LnNlbmQobmV3IFB1Ymxpc2hDb21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvcGljQXJuOiBwcm9jZXNzLmVudi5UUkFOU0FDVElPTlNfUFJPQ0VTU0lOR19UT1BJQ19BUk4hLFxuICAgICAgICAgICAgICAgICAgICAgICAgTWVzc2FnZTogSlNPTi5zdHJpbmdpZnkodHJhbnNhY3Rpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGUgbWVzc2FnZSBncm91cCBpZCwgd2lsbCBiZSByZXByZXNlbnRlZCBieSB0aGUgT2xpdmUgbWVtYmVyIGlkLCBzbyB0aGF0IHdlIGNhbiBncm91cCB0cmFuc2FjdGlvbiBtZXNzYWdlcyBmb3IgYSBwYXJ0aWN1bGFyIG1lbWJlciBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGFzc29jaWF0ZWQgdG8gYSBNb29uYmVhbSB1c2VyIGlkLCBhbmQgc29ydCB0aGVtIGluIHRoZSBGSUZPIHByb2Nlc3NpbmcgdG9waWMgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIE1lc3NhZ2VHcm91cElkOiB0cmFuc2FjdGlvbi5tZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2Ugd2FzIHByb3Blcmx5IHNlbnQgdG8gdGhlIGFwcHJvcHJpYXRlIHByb2Nlc3NpbmcgdG9waWNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zYWN0aW9uUmVjZWlwdCAmJiB0cmFuc2FjdGlvblJlY2VpcHQuTWVzc2FnZUlkICYmIHRyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWQubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblJlY2VpcHQuU2VxdWVuY2VOdW1iZXIgJiYgdHJhbnNhY3Rpb25SZWNlaXB0LlNlcXVlbmNlTnVtYmVyLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGUgdHJhbnNhY3Rpb24gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGRyb3BwZWQgaW50byB0aGUgdG9waWMsIGFuZCB3aWxsIGJlIHBpY2tlZCB1cCBieSB0aGUgdHJhbnNhY3Rpb25zIGNvbnN1bWVyIGFuZCBvdGhlclxuICAgICAgICAgICAgICAgICAgICAgICAgICogc2VydmljZXMsIGxpa2UgdGhlIG5vdGlmaWNhdGlvbnMgc2VydmljZSBjb25zdW1lci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFRyYW5zYWN0aW9uIHN1Y2Nlc3NmdWxseSBzZW50IHRvIHRvcGljIGZvciBwcm9jZXNzaW5nIHdpdGggcmVjZWlwdCBpbmZvcm1hdGlvbjogJHt0cmFuc2FjdGlvblJlY2VpcHQuTWVzc2FnZUlkfSAke3RyYW5zYWN0aW9uUmVjZWlwdC5TZXF1ZW5jZU51bWJlcn1gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBgVHJhbnNhY3Rpb24gYWNrbm93bGVkZ2VkIWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2VuZGluZyB0aGUgdHJhbnNhY3Rpb24gbWVzc2FnZSBmdXJ0aGVyIWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHNlbmRpbmcgdGhlIG1lc3NhZ2UgdG8gdGhlIHRvcGljLlxuICAgICAgICAgICAgICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQyNCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVucHJvY2Vzc2FibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBUcmFuc2FjdGlvbiBpcyBub3QgYSByZWRlZW1hYmxlIG9mZmVyLiBOb3QgcHJvY2Vzc2luZy5gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIHJldHVybiBhIDJ4eCByZXNwb25zZSBoZXJlLCBzaW5jZSB0aGlzIGlzIG5vdCBhIHRydWUgZXJyb3Igd29ydGggcmV0cnlpbmcgdGhlIHByb2Nlc3NpbmcsIGJ1dCByYXRoZXIgYW4gaW5kaWNhdGlvbiBvZiBmaWx0ZXJpbmdcbiAgICAgICAgICAgICAgICAgICAgICogdGhlcmUncyBubyBuZWVkIHRvIGluZGljYXRlIHRoYXQgT2xpdmUgc2hvdWxkIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlLCBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIHByb2Nlc3MgaXQgZm9yIG5vdywgZm9yIHJlZGVlbWVkIG9mZmVycyBwdXJwb3Nlc1xuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVucHJvY2Vzc2FibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGludmFsaWQgcmVxdWVzdCBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCByZXF1ZXN0IGJvZHkgcGFzc2VkIGluLmA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke3JlcXVlc3RCb2R5fWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAqIE9saXZlIHdpbGwgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSByZXF1ZXN0IGJvZHkgaXMgbnVsbCwgcmV0dXJuIGEgdmFsaWRhdGlvbiBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgcmVxdWVzdCBib2R5IHBhc3NlZCBpbi5gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke3JlcXVlc3RCb2R5fWApO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHJldHVybiB0aGUgZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAqIE9saXZlIHdpbGwgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgJHtyb3V0ZX0gcmVxdWVzdGA7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJvcn1gKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxufVxuIl19