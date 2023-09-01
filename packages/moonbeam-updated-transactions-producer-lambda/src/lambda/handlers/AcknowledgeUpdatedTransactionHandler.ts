import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {TransactionsErrorType} from "@moonbeam/moonbeam-models";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

/**
 * AcknowledgeUpdatedTransaction handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
export const acknowledgeUpdatedTransaction = async (route: string, requestBody: string | null): Promise<APIGatewayProxyResult> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

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
                requestBodyParsed["data"]  !== undefined && requestBodyParsed["data"]  !== null &&
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
                const snsClient = new SNSClient({region: region});

                /**
                 * drop the updated transaction as a message to the updated transactions processing topic
                 */
                const updatedTransactionReceipt = await snsClient.send(new PublishCommand({
                    TopicArn: process.env.UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN!,
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
                    }
                } else {
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
