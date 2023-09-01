import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {Transaction, TransactionsErrorType, TransactionsStatus, TransactionType} from "@moonbeam/moonbeam-models";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

/**
 * AcknowledgeTransaction handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
export const acknowledgeTransaction = async (route: string, requestBody: string | null): Promise<APIGatewayProxyResult> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

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
                requestData["memberId"] !==undefined && requestData["memberId"] !==null &&
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
                    const transaction: Transaction = {
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
                            ? requestData["transaction"]["moonbeamTransactionStatus"] as TransactionsStatus
                            : TransactionsStatus.Pending,
                        // the type of this transaction will be an offer redeemed type for now. In the future when we process different types of transactions, this might change
                        transactionType: TransactionType.OfferRedeemed,
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
                    }

                    // initializing the SNS Client
                    const snsClient = new SNSClient({region: region});

                    /**
                     * drop the transaction as a message to the transactions processing topic
                     *
                     * note: in the future when we will have other types of transactions, other than offer based ones, we will need to add a filter
                     * through the message attributes of the topic, so that only messages with specific filters get dropped to a particular processing
                     * queue.
                     */
                    const transactionReceipt = await snsClient.send(new PublishCommand({
                        TopicArn: process.env.TRANSACTIONS_PROCESSING_TOPIC_ARN!,
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
                        }
                    } else {
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
                                errorType: TransactionsErrorType.Unprocessable,
                                errorMessage: errorMessage
                            })
                        }
                    }
                } else {
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
                            errorType: TransactionsErrorType.Unprocessable,
                            errorMessage: errorMessage
                        })
                    }
                }
            } else {
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
                        errorType: TransactionsErrorType.ValidationError,
                        errorMessage: errorMessage
                    })
                }
            }
        } else {
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
                    errorType: TransactionsErrorType.ValidationError,
                    errorMessage: errorMessage
                })
            }
        }
    } catch (error) {
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
                errorType: TransactionsErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        }
    }
}
