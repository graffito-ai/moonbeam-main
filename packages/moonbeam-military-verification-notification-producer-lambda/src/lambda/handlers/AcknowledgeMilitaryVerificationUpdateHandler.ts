import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {
    MilitaryVerificationErrorType,
    MilitaryVerificationNotificationUpdate,
    MilitaryVerificationStatusType
} from "@moonbeam/moonbeam-models";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

/**
 * AcknowledgeMilitaryVerificationUpdate handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
export const acknowledgeMilitaryVerificationUpdate = async (route: string, requestBody: string | null): Promise<APIGatewayProxyResult> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // first check whether we have a valid request body.
        if (requestBody !== undefined && requestBody !== null && requestBody.length !== 0) {
            // parse the incoming request body data as an MilitaryVerificationNotificationUpdate object
            const requestBodyParsed = JSON.parse(requestBody) as MilitaryVerificationNotificationUpdate;

            /**
             * check to see if we transition from appropriate statuses, in order to trigger the military verification notification
             * update process:
             * - PENDING to VERIFIED
             * - PENDING to REJECTED
             */
            if ((requestBodyParsed.originalMilitaryVerificationStatus === MilitaryVerificationStatusType.Pending
                    && requestBodyParsed.newMilitaryVerificationStatus === MilitaryVerificationStatusType.Verified) ||
                (requestBodyParsed.originalMilitaryVerificationStatus === MilitaryVerificationStatusType.Pending
                    && requestBodyParsed.newMilitaryVerificationStatus === MilitaryVerificationStatusType.Rejected)) {
                // initializing the SNS Client
                const snsClient = new SNSClient({region: region});

                /**
                 * drop the military verification input as a message to the military verification updates/notifications processing topic
                 */
                const militaryVerificationUpdateReceipt = await snsClient.send(new PublishCommand({
                    TopicArn: process.env.MILITARY_VERIFICATION_NOTIFICATION_PROCESSING_TOPIC_ARN!,
                    Message: JSON.stringify(requestBodyParsed),
                    /**
                     * the message group id, will be represented by the Moonbeam internal user id, so that we can group military verification update messages for a particular
                     * user id, and sort them in the FIFO processing topic accordingly.
                     */
                    MessageGroupId: requestBodyParsed.id
                }));

                // ensure that the military verification updates/notification message was properly sent to the appropriate processing topic
                if (militaryVerificationUpdateReceipt && militaryVerificationUpdateReceipt.MessageId && militaryVerificationUpdateReceipt.MessageId.length !== 0 &&
                    militaryVerificationUpdateReceipt.SequenceNumber && militaryVerificationUpdateReceipt.SequenceNumber.length !== 0) {
                    /**
                     * the military verification update has been successfully dropped into the topic, and will be picked up by the military verification updates
                     * and/or notifications consumer.
                     */
                    console.log(`Military verification update successfully sent to topic for processing with receipt information: ${militaryVerificationUpdateReceipt.MessageId} ${militaryVerificationUpdateReceipt.SequenceNumber}`);

                    return {
                        statusCode: 202,
                        body: JSON.stringify({
                            data: `Military verification update acknowledged!`
                        })
                    }
                } else {
                    const errorMessage = `Unexpected error while sending the military verification update message further!`;
                    console.log(errorMessage);

                    /**
                     * if there are errors associated with sending the message to the topic.
                     */
                    return {
                        statusCode: 424,
                        body: JSON.stringify({
                            data: null,
                            errorType: MilitaryVerificationErrorType.Unprocessable,
                            errorMessage: errorMessage
                        })
                    }
                }
            } else {
                // if the status transition is not valid, then return a non-processable error accordingly
                const errorMessage = `Invalid military verification status transition for notification process to get triggered!`;
                console.log(errorMessage);

                /**
                 * if there are errors associated with sending the message to the topic.
                 */
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        data: null,
                        errorType: MilitaryVerificationErrorType.ValidationError,
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
                    errorType: MilitaryVerificationErrorType.ValidationError,
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
                errorType: MilitaryVerificationErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        }
    }
}
