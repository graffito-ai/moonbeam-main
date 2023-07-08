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
                requestData["transaction"]["id"] && requestData["transaction"]["cardId"] &&
                requestData["transaction"]["created"] && requestData["transaction"]["currencyCode"] &&
                requestData["transaction"]["created"] && requestData["transaction"]["merchantCategoryCode"]) {
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
                        transactionId: requestData["transaction"]["id"],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VUcmFuc2FjdGlvbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL0Fja25vd2xlZGdlVHJhbnNhY3Rpb25IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUFrSDtBQUNsSCxvREFBOEQ7QUFFOUQ7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBRSxXQUEwQixFQUFrQyxFQUFFO0lBQ3RILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0RBQW9EO1FBQ3BELElBQUksV0FBVyxFQUFFO1lBQ2Isd0RBQXdEO1lBQ3hELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRCxNQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUVqRix5R0FBeUc7WUFDekcsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXO2dCQUMxRSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUM7Z0JBQzlFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDO2dCQUN4RSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQztnQkFDbkYsV0FBVyxDQUFDLGFB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QUNILHFFQUFxRTtZQUNyRSxNQUFNLFlBQVksR0FBRyxpQ0FBaUMsQ0FBQztZQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFFOUM7OztlQUdHO1lBQ0gsT0FBTztnQkFDSCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsSUFBSSxFQUFFLElBQUk7b0JBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7b0JBQ2hELFlBQVksRUFBRSxZQUFZO2lCQUM3QixDQUFDO2FBQ0wsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE1BQU0sWUFBWSxHQUFHLHFDQUFxQyxLQUFLLFVBQVUsQ0FBQztRQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFeEM7OztXQUdHO1FBQ0gsT0FBTztZQUNILFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxJQUFJO2dCQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO2dCQUNoRCxZQUFZLEVBQUUsWUFBWTthQUM3QixDQUFDO1NBQ0wsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBaExZLFFBQUEsc0JBQXNCLDBCQWdMbEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FQSUdhdGV3YXlQcm94eVJlc3VsdH0gZnJvbSBcImF3cy1sYW1iZGEvdHJpZ2dlci9hcGktZ2F0ZXdheS1wcm94eVwiO1xuaW1wb3J0IHtUcmFuc2FjdGlvbiwgVHJhbnNhY3Rpb25zRXJyb3JUeXBlLCBUcmFuc2FjdGlvbnNTdGF0dXMsIFRyYW5zYWN0aW9uVHlwZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UHVibGlzaENvbW1hbmQsIFNOU0NsaWVudH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zbnNcIjtcblxuLyoqXG4gKiBBY2tub3dsZWRnZVRyYW5zYWN0aW9uIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gcm91dGUgcmVxdWVzdCByb3V0ZSwgY29tcG9zZWQgb2YgSFRUUCBWZXJiIGFuZCBIVFRQIFBhdGhcbiAqIEBwYXJhbSByZXF1ZXN0Qm9keSByZXF1ZXN0IGJvZHkgaW5wdXQsIHBhc3NlZCBieSB0aGUgY2FsbGVyIHRocm91Z2ggdGhlIEFQSSBHYXRld2F5IGV2ZW50XG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBUElHYXRld2F5UHJveHlSZXN1bHR9XG4gKi9cbmV4cG9ydCBjb25zdCBhY2tub3dsZWRnZVRyYW5zYWN0aW9uID0gYXN5bmMgKHJvdXRlOiBzdHJpbmcsIHJlcXVlc3RCb2R5OiBzdHJpbmcgfCBudWxsKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBmaXJzdCBjaGVjayB3aGV0aGVyIHdlIGhhdmUgYSB2YWxpZCByZXF1ZXN0IGJvZHkuXG4gICAgICAgIGlmIChyZXF1ZXN0Qm9keSkge1xuICAgICAgICAgICAgLy8gcGFyc2UgdGhlIGluY29taW5nIHJlcXVlc3QgYm9keSBkYXRhIGFzIGEgSlNPTiBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RCb2R5UGFyc2VkID0gSlNPTi5wYXJzZShyZXF1ZXN0Qm9keSk7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXSA/IHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXSA6IG51bGw7XG5cbiAgICAgICAgICAgIC8vIHBlcmZvcm0gc29tZSB2YWxpZGF0aW9ucyBiYXNlZCBvbiB3aGF0IGlzIGV4cGVjdGVkIGluIHRlcm1zIG9mIHRoZSBpbmNvbWluZyBkYXRhIG1vZGVsIGFuZCBpdHMgbWFwcGluZ1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXSAmJiByZXF1ZXN0Qm9keVBhcnNlZFtcInRpbWVzdGFtcFwiXSAmJiByZXF1ZXN0RGF0YSAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1wiY2FyZElkXCJdICYmIHJlcXVlc3REYXRhW1wibWVtYmVySWRcIl0gJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXSAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJpZFwiXSAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY2FyZElkXCJdICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImNyZWF0ZWRcIl0gJiYgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImN1cnJlbmN5Q29kZVwiXSAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJjcmVhdGVkXCJdICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJtZXJjaGFudENhdGVnb3J5Q29kZVwiXSkge1xuXG4gICAgICAgICAgICAgICAgLy8gZmlsdGVyIGJhc2VkIG9uIHdoZXRoZXIgYW4gaW5jb21pbmcgdHJhbnNhY3Rpb24gaXMgYSByZWRlZW1hYmxlIG9mZmVyIG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYW1vdW50XCJdICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJicmFuZElkXCJdICYmXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJsb3lhbHR5UHJvZ3JhbUlkXCJdICYmIHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJyZXdhcmRBbW91bnRcIl0gJiZcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInN0b3JlSWRcIl0pIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0IGZyb20gdGhlIGluY29taW5nIHJlcXVlc3QgYm9keVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSB0cmFuc2FjdGlvbiBpZCwgaXMgcmVwcmVzZW50ZWQgYnkgdGhlIHVzZXJJZCBvZiB0aGUgYXNzb2NpYXRlZCBNb29uYmVhbSB1c2VyLCB0byBiZSBvYnRhaW5lZCBkdXJpbmcgcHJvY2Vzc2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICogdGhyb3VnaCB0aGUgR0VUIG1lbWJlciBkZXRhaWxzIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IHJlcXVlc3REYXRhW1wibWVtYmVySWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yZUlkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wic3RvcmVJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kSWQ6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJicmFuZElkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZElkOiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY2FyZElkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJtZXJjaGFudENhdGVnb3J5Q29kZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZTogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcImN1cnJlbmN5Q29kZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQ6IHJlcXVlc3REYXRhW1widHJhbnNhY3Rpb25cIl1bXCJpZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgc3RhdHVzIG9mIGFsbCBpbmNvbWluZyB0cmFuc2FjdGlvbnMgdG8gYmUgcGVuZGluZywgdW50aWwgd2UgZ2V0IGEgc3RhdHVzIGNoYW5nZSBhbmQvb3IgdW50aWwgdGhlIGNhc2hiYWNrIGlzIHJlaW1idXJzZWQgdG8gdGhlIGN1c3RvbWVyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czogVHJhbnNhY3Rpb25zU3RhdHVzLlBlbmRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdHlwZSBvZiB0aGlzIHRyYW5zYWN0aW9uIHdpbGwgYmUgYW4gb2ZmZXIgcmVkZWVtZWQgdHlwZSBmb3Igbm93LiBJbiB0aGUgZnV0dXJlIHdoZW4gd2UgcHJvY2VzcyBkaWZmZXJlbnQgdHlwZXMgb2YgdHJhbnNhY3Rpb25zLCB0aGlzIG1pZ2h0IGNoYW5nZVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlOiBUcmFuc2FjdGlvblR5cGUuT2ZmZXJSZWRlZW1lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogYXQgY3JlYXRpb24gdGltZSwgdGhlc2UgdGltZXN0YW1wcyB3b24ndCBiZSBjb252ZXJ0ZWQgYXBwcm9wcmlhdGVseSwgdG8gd2hhdCB3ZSBleHBlY3QgdGhlbSB0byBsb29rIGxpa2UuIFRoYXQgY29udmVyc2lvbiB3aWxsIGJlIGRvbmUgYWxsIGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBwcm9jZXNzaW5nIHRpbWUsIGJ1dCBpdCB3aWxsIGFsbCBkZXBlbmQgb24gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHRyYW5zYWN0aW9uLCB3aGljaCBpcyB3aHkgd2Ugb25seSBwYXNzZWQgaW4gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBiZWxvdy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiY3JlYXRlZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudDogcmVxdWVzdERhdGFbXCJ0cmFuc2FjdGlvblwiXVtcInJld2FyZEFtb3VudFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wiYW1vdW50XCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Ugc3RhcnQgd2l0aCAwIGRvbGxhcnMgY3JlZGl0ZWQgdG8gdGhlIGN1c3RvbWVyLCBzaW5jZSB0aGUgd2hvbGUgcmV3YXJkIGFtb3VudCBpcyBwZW5kaW5nIGNyZWRpdCBhdCB0cmFuc2FjdGlvbiBjcmVhdGlvbiB0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uXCJdW1wicmV3YXJkQW1vdW50XCJdXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIFNOUyBDbGllbnRcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc25zQ2xpZW50ID0gbmV3IFNOU0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogZHJvcCB0aGUgdHJhbnNhY3Rpb24gYXMgYSBtZXNzYWdlIHRvIHRoZSB0cmFuc2FjdGlvbnMgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBub3RlOiBpbiB0aGUgZnV0dXJlIHdoZW4gd2Ugd2lsbCBoYXZlIG90aGVyIHR5cGVzIG9mIHRyYW5zYWN0aW9ucywgb3RoZXIgdGhhbiBvZmZlciBiYXNlZCBvbmVzLCB3ZSB3aWxsIG5lZWQgdG8gYWRkIGEgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAqIHRocm91Z2ggdGhlIG1lc3NhZ2UgYXR0cmlidXRlcyBvZiB0aGUgdG9waWMsIHNvIHRoYXQgb25seSBtZXNzYWdlcyB3aXRoIHNwZWNpZmljIGZpbHRlcnMgZ2V0IGRyb3BwZWQgdG8gYSBwYXJ0aWN1bGFyIHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgICogcXVldWUuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvblJlY2VpcHQgPSBhd2FpdCBzbnNDbGllbnQuc2VuZChuZXcgUHVibGlzaENvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgVG9waWNBcm46IHByb2Nlc3MuZW52LlRSQU5TQUNUSU9OU19QUk9DRVNTSU5HX1RPUElDX0FSTiEsXG4gICAgICAgICAgICAgICAgICAgICAgICBNZXNzYWdlOiBKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSBtZXNzYWdlIGdyb3VwIGlkLCB3aWxsIGJlIHJlcHJlc2VudGVkIGJ5IHRoZSBPbGl2ZSBtZW1iZXIgaWQsIHNvIHRoYXQgd2UgY2FuIGdyb3VwIHRyYW5zYWN0aW9uIG1lc3NhZ2VzIGZvciBhIHBhcnRpY3VsYXIgbWVtYmVyIGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICogYXNzb2NpYXRlZCB0byBhIE1vb25iZWFtIHVzZXIgaWQsIGFuZCBzb3J0IHRoZW0gaW4gdGhlIEZJRk8gcHJvY2Vzc2luZyB0b3BpYyBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgTWVzc2FnZUdyb3VwSWQ6IHRyYW5zYWN0aW9uLm1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgdHJhbnNhY3Rpb24gbWVzc2FnZSB3YXMgcHJvcGVybHkgc2VudCB0byB0aGUgYXBwcm9wcmlhdGUgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNhY3Rpb25SZWNlaXB0ICYmIHRyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWQgJiYgdHJhbnNhY3Rpb25SZWNlaXB0Lk1lc3NhZ2VJZC5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uUmVjZWlwdC5TZXF1ZW5jZU51bWJlciAmJiB0cmFuc2FjdGlvblJlY2VpcHQuU2VxdWVuY2VOdW1iZXIubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSB0cmFuc2FjdGlvbiBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgZHJvcHBlZCBpbnRvIHRoZSB0b3BpYywgYW5kIHdpbGwgYmUgcGlja2VkIHVwIGJ5IHRoZSB0cmFuc2FjdGlvbnMgY29uc3VtZXIgYW5kIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBzZXJ2aWNlcywgbGlrZSB0aGUgbm90aWZpY2F0aW9ucyBzZXJ2aWNlIGNvbnN1bWVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVHJhbnNhY3Rpb24gc3VjY2Vzc2Z1bGx5IHNlbnQgdG8gdG9waWMgZm9yIHByb2Nlc3Npbmcgd2l0aCByZWNlaXB0IGluZm9ybWF0aW9uOiAke3RyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWR9ICR7dHJhbnNhY3Rpb25SZWNlaXB0LlNlcXVlbmNlTnVtYmVyfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGBUcmFuc2FjdGlvbiBhY2tub3dsZWRnZWQhYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZW5kaW5nIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlIGZ1cnRoZXIhYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggc2VuZGluZyB0aGUgbWVzc2FnZSB0byB0aGUgdG9waWMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5wcm9jZXNzYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFRyYW5zYWN0aW9uIGlzIG5vdCBhIHJlZGVlbWFibGUgb2ZmZXIuIE5vdCBwcm9jZXNzaW5nLmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXF1ZXN0Qm9keX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogcmV0dXJuIGEgMnh4IHJlc3BvbnNlIGhlcmUsIHNpbmNlIHRoaXMgaXMgbm90IGEgdHJ1ZSBlcnJvciB3b3J0aCByZXRyeWluZyB0aGUgcHJvY2Vzc2luZywgYnV0IHJhdGhlciBhbiBpbmRpY2F0aW9uIG9mIGZpbHRlcmluZ1xuICAgICAgICAgICAgICAgICAgICAgKiB0aGVyZSdzIG5vIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCBPbGl2ZSBzaG91bGQgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UsIHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gcHJvY2VzcyBpdCBmb3Igbm93LCBmb3IgcmVkZWVtZWQgb2ZmZXJzIHB1cnBvc2VzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5wcm9jZXNzYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW52YWxpZCByZXF1ZXN0IG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlcXVlc3QgYm9keSBwYXNzZWQgaW4uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlcXVlc3QgYm9keSBpcyBudWxsLCByZXR1cm4gYSB2YWxpZGF0aW9uIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCByZXF1ZXN0IGJvZHkgcGFzc2VkIGluLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke3JvdXRlfSByZXF1ZXN0YDtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAqIE9saXZlIHdpbGwgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=