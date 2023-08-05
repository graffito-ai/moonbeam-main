import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {EligibleLinkedUser, ReimbursementsErrorType, TransactionsErrorType} from "@moonbeam/moonbeam-models";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

/**
 * AcknowledgeReimbursement handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
export const acknowledgeReimbursement = async (route: string, requestBody: string | null): Promise<APIGatewayProxyResult> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // first check whether we have a valid request body.
        if (requestBody) {
            // parse the incoming request body data as a JSON object
            const requestBodyParsed = JSON.parse(requestBody);

            // perform some validations based on what is expected in terms of the incoming data model and its mapping
            if (requestBodyParsed["id"] && requestBodyParsed["cardId"] && requestBodyParsed["memberId"]) {
                // build the eligible linked user object from the incoming request body
                const eligibleLinkedUser: EligibleLinkedUser = requestBodyParsed as EligibleLinkedUser;

                // initializing the SNS Client
                const snsClient = new SNSClient({region: region});

                /**
                 * drop the eligible linked user as a message to the reimbursements processing topic
                 */
                const reimbursementReceipt = await snsClient.send(new PublishCommand({
                    TopicArn: process.env.REIMBURSEMENTS_PROCESSING_TOPIC_ARN!,
                    Message: JSON.stringify(eligibleLinkedUser),
                    /**
                     * the message group id, will be represented by the Olive member id, so that we can group reimbursement messages for a particular member id,
                     * associated to a Moonbeam user id, and sort them in the FIFO processing topic accordingly.
                     */
                    MessageGroupId: eligibleLinkedUser.memberId
                }));

                // ensure that the reimbursement message was properly sent to the appropriate processing topic
                if (reimbursementReceipt && reimbursementReceipt.MessageId && reimbursementReceipt.MessageId.length !== 0 &&
                    reimbursementReceipt.SequenceNumber && reimbursementReceipt.SequenceNumber.length !== 0) {
                    /**
                     * the eligible linked user has been successfully dropped into the topic, and will be picked up by the reimbursements consumer and other
                     * services, like the notifications service consumer.
                     */
                    console.log(`Eligible linked user for reimbursements, successfully sent to topic for processing with receipt information: ${reimbursementReceipt.MessageId} ${reimbursementReceipt.SequenceNumber}`);

                    return {
                        statusCode: 202,
                        body: JSON.stringify({
                            data: `Reimbursement acknowledged!`
                        })
                    }
                } else {
                    const errorMessage = `Unexpected error while sending the reimbursement message further!`;
                    console.log(errorMessage);

                    /**
                     * if there are errors associated with sending the message to the topic.
                     * We will need to retry sending this message upon receiving of a non 2XX code
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
                const errorMessage = `Reimbursement object is not possible to process. Not processing.`;
                console.log(`${errorMessage} ${requestBody}`);

                /**
                 * return the error accordingly
                 * We will need to retry sending this message upon receiving of a non 2XX code
                 */
                return {
                    statusCode: 424,
                    body: JSON.stringify({
                        data: null,
                        errorType: ReimbursementsErrorType.Unprocessable,
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
             * We will need to retry sending this message upon receiving of a non 2XX code
             */
            return {
                statusCode: 400,
                body: JSON.stringify({
                    data: null,
                    errorType: ReimbursementsErrorType.ValidationError,
                    errorMessage: errorMessage
                })
            }
        }

    } catch (error) {
        const errorMessage = `Unexpected error while processing ${route} request`;
        console.log(`${errorMessage} ${error}`);

        /**
         * return the error accordingly
         * We will retry sending this message upon receiving of a non 2XX code
         */
        return {
            statusCode: 500,
            body: JSON.stringify({
                data: null,
                errorType: ReimbursementsErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        }
    }
}
