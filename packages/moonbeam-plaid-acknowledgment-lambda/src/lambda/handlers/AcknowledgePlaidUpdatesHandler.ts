import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {
    PlaidLinkingErrorType,
    PlaidWebhookLinkInput,
    PlaidWebhookStatus,
    PlaidWebhookType, TransactionsErrorType
} from "@moonbeam/moonbeam-models";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

/**
 * AcknowledgePlaidUpdates handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
export const acknowledgePlaidUpdate = async (route: string, requestBody: string | null): Promise<APIGatewayProxyResult> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

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
                switch (requestBodyParsed["webhook_type"] as PlaidWebhookType) {
                    case PlaidWebhookType.Link:
                        // convert the incoming data to a PlaidWebhookLinkInput object
                        const plaidWebhookLinkInput: PlaidWebhookLinkInput = requestBodyParsed as PlaidWebhookLinkInput;

                        // make sure that this particular webhook type input, is valid
                        if (plaidWebhookLinkInput.status === PlaidWebhookStatus.Success && (plaidWebhookLinkInput.public_token === undefined || plaidWebhookLinkInput.public_token === null)) {
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
                                    errorType: PlaidLinkingErrorType.ValidationError,
                                    errorMessage: errorMessage
                                })
                            }
                        }

                        /**
                         * at this point we know that the input object/data is valid, so we will just need to drop this as a message
                         * into the appropriate SNS topic.
                         *
                         * initializing the SNS Client
                         */
                        const snsClient = new SNSClient({region: region});

                        /**
                         * drop the transaction as a message to the Plaid Link processing topic
                         */
                        const plaidLinkReceipt = await snsClient.send(new PublishCommand({
                            TopicArn: process.env.PLAID_LINK_PROCESSING_TOPIC_ARN!,
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
                            }
                        } else {
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
                                    errorType: TransactionsErrorType.Unprocessable,
                                    errorMessage: errorMessage
                                })
                            }
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
                                errorType: PlaidLinkingErrorType.ValidationError,
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
                 * Plaid will retry sending this message upon receiving of a non 2XX code
                 */
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        data: null,
                        errorType: PlaidLinkingErrorType.ValidationError,
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
             * Plaid will retry sending this message upon receiving of a non 2XX code
             */
            return {
                statusCode: 400,
                body: JSON.stringify({
                    data: null,
                    errorType: PlaidLinkingErrorType.ValidationError,
                    errorMessage: errorMessage
                })
            }
        }
    } catch (error) {
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
                errorType: PlaidLinkingErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        }
    }
}
