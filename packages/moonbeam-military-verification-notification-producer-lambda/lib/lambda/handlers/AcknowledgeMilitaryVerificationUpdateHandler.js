"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeMilitaryVerificationUpdate = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_sns_1 = require("@aws-sdk/client-sns");
/**
 * AcknowledgeMilitaryVerificationUpdate handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
const acknowledgeMilitaryVerificationUpdate = async (route, requestBody) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // first check whether we have a valid request body.
        if (requestBody !== undefined && requestBody !== null && requestBody.length !== 0) {
            // parse the incoming request body data as an MilitaryVerificationNotificationUpdate object
            const requestBodyParsed = JSON.parse(requestBody);
            /**
             * check to see if we transition from appropriate statuses, in order to trigger the military verification notification
             * update process:
             * - PENDING to VERIFIED
             * - PENDING to REJECTED
             */
            if ((requestBodyParsed.originalMilitaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Pending
                && requestBodyParsed.newMilitaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified) ||
                (requestBodyParsed.originalMilitaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Pending
                    && requestBodyParsed.newMilitaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Rejected)) {
                // initializing the SNS Client
                const snsClient = new client_sns_1.SNSClient({ region: region });
                /**
                 * drop the military verification input as a message to the military verification updates/notifications processing topic
                 */
                const militaryVerificationUpdateReceipt = await snsClient.send(new client_sns_1.PublishCommand({
                    TopicArn: process.env.MILITARY_VERIFICATION_NOTIFICATION_PROCESSING_TOPIC_ARN,
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
                    };
                }
                else {
                    const errorMessage = `Unexpected error while sending the military verification update message further!`;
                    console.log(errorMessage);
                    /**
                     * if there are errors associated with sending the message to the topic.
                     */
                    return {
                        statusCode: 424,
                        body: JSON.stringify({
                            data: null,
                            errorType: moonbeam_models_1.MilitaryVerificationErrorType.Unprocessable,
                            errorMessage: errorMessage
                        })
                    };
                }
            }
            else {
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
                        errorType: moonbeam_models_1.MilitaryVerificationErrorType.ValidationError,
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
                    errorType: moonbeam_models_1.MilitaryVerificationErrorType.ValidationError,
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
                errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        };
    }
};
exports.acknowledgeMilitaryVerificationUpdate = acknowledgeMilitaryVerificationUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VNaWxpdGFyeVZlcmlmaWNhdGlvblVwZGF0ZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL0Fja25vd2xlZGdlTWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUltQztBQUNuQyxvREFBOEQ7QUFFOUQ7Ozs7Ozs7R0FPRztBQUNJLE1BQU0scUNBQXFDLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBRSxXQUEwQixFQUFrQyxFQUFFO0lBQ3JJLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0RBQW9EO1FBQ3BELElBQUksV0FBVyxLQUFLLFNBQVMsSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9FLDJGQUEyRjtZQUMzRixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUEyQyxDQUFDO1lBRTVGOzs7OztlQUtHO1lBQ0gsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtDQUFrQyxLQUFLLGdEQUE4QixDQUFDLE9BQU87bUJBQ3pGLGlCQUFpQixDQUFDLDZCQUE2QixLQUFLLGdEQUE4QixDQUFDLFFBQVEsQ0FBQztnQkFDbkcsQ0FBQyxpQkFBaUIsQ0FBQyxrQ0FBa0MsS0FBSyxnREFBOEIsQ0FBQyxPQUFPO3VCQUN6RixpQkFBaUIsQ0FBQyw2QkFBNkIsS0FBSyxnREFBOEIsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDckcsOEJBQThCO2dCQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLHNCQUFTLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztnQkFFbEQ7O21CQUVHO2dCQUNILE1BQU0saUNBQWlDLEdB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SGpEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7XG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1B1Ymxpc2hDb21tYW5kLCBTTlNDbGllbnR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtc25zXCI7XG5cbi8qKlxuICogQWNrbm93bGVkZ2VNaWxpdGFyeVZlcmlmaWNhdGlvblVwZGF0ZSBoYW5kbGVyXG4gKlxuICogQHBhcmFtIHJvdXRlIHJlcXVlc3Qgcm91dGUsIGNvbXBvc2VkIG9mIEhUVFAgVmVyYiBhbmQgSFRUUCBQYXRoXG4gKiBAcGFyYW0gcmVxdWVzdEJvZHkgcmVxdWVzdCBib2R5IGlucHV0LCBwYXNzZWQgYnkgdGhlIGNhbGxlciB0aHJvdWdoIHRoZSBBUEkgR2F0ZXdheSBldmVudFxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQVBJR2F0ZXdheVByb3h5UmVzdWx0fVxuICovXG5leHBvcnQgY29uc3QgYWNrbm93bGVkZ2VNaWxpdGFyeVZlcmlmaWNhdGlvblVwZGF0ZSA9IGFzeW5jIChyb3V0ZTogc3RyaW5nLCByZXF1ZXN0Qm9keTogc3RyaW5nIHwgbnVsbCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gZmlyc3QgY2hlY2sgd2hldGhlciB3ZSBoYXZlIGEgdmFsaWQgcmVxdWVzdCBib2R5LlxuICAgICAgICBpZiAocmVxdWVzdEJvZHkgIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keSAhPT0gbnVsbCAmJiByZXF1ZXN0Qm9keS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIHBhcnNlIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHkgZGF0YSBhcyBhbiBNaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZSBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RCb2R5UGFyc2VkID0gSlNPTi5wYXJzZShyZXF1ZXN0Qm9keSkgYXMgTWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGU7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHdlIHRyYW5zaXRpb24gZnJvbSBhcHByb3ByaWF0ZSBzdGF0dXNlcywgaW4gb3JkZXIgdG8gdHJpZ2dlciB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICogdXBkYXRlIHByb2Nlc3M6XG4gICAgICAgICAgICAgKiAtIFBFTkRJTkcgdG8gVkVSSUZJRURcbiAgICAgICAgICAgICAqIC0gUEVORElORyB0byBSRUpFQ1RFRFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoKHJlcXVlc3RCb2R5UGFyc2VkLm9yaWdpbmFsTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nXG4gICAgICAgICAgICAgICAgICAgICYmIHJlcXVlc3RCb2R5UGFyc2VkLm5ld01pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID09PSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQpIHx8XG4gICAgICAgICAgICAgICAgKHJlcXVlc3RCb2R5UGFyc2VkLm9yaWdpbmFsTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nXG4gICAgICAgICAgICAgICAgICAgICYmIHJlcXVlc3RCb2R5UGFyc2VkLm5ld01pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID09PSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUmVqZWN0ZWQpKSB7XG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBTTlMgQ2xpZW50XG4gICAgICAgICAgICAgICAgY29uc3Qgc25zQ2xpZW50ID0gbmV3IFNOU0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGRyb3AgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbnB1dCBhcyBhIG1lc3NhZ2UgdG8gdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiB1cGRhdGVzL25vdGlmaWNhdGlvbnMgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlUmVjZWlwdCA9IGF3YWl0IHNuc0NsaWVudC5zZW5kKG5ldyBQdWJsaXNoQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRvcGljQXJuOiBwcm9jZXNzLmVudi5NSUxJVEFSWV9WRVJJRklDQVRJT05fTk9USUZJQ0FUSU9OX1BST0NFU1NJTkdfVE9QSUNfQVJOISxcbiAgICAgICAgICAgICAgICAgICAgTWVzc2FnZTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdEJvZHlQYXJzZWQpLFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogdGhlIG1lc3NhZ2UgZ3JvdXAgaWQsIHdpbGwgYmUgcmVwcmVzZW50ZWQgYnkgdGhlIE1vb25iZWFtIGludGVybmFsIHVzZXIgaWQsIHNvIHRoYXQgd2UgY2FuIGdyb3VwIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiB1cGRhdGUgbWVzc2FnZXMgZm9yIGEgcGFydGljdWxhclxuICAgICAgICAgICAgICAgICAgICAgKiB1c2VyIGlkLCBhbmQgc29ydCB0aGVtIGluIHRoZSBGSUZPIHByb2Nlc3NpbmcgdG9waWMgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBNZXNzYWdlR3JvdXBJZDogcmVxdWVzdEJvZHlQYXJzZWQuaWRcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHVwZGF0ZXMvbm90aWZpY2F0aW9uIG1lc3NhZ2Ugd2FzIHByb3Blcmx5IHNlbnQgdG8gdGhlIGFwcHJvcHJpYXRlIHByb2Nlc3NpbmcgdG9waWNcbiAgICAgICAgICAgICAgICBpZiAobWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVSZWNlaXB0ICYmIG1pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlUmVjZWlwdC5NZXNzYWdlSWQgJiYgbWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVSZWNlaXB0Lk1lc3NhZ2VJZC5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVSZWNlaXB0LlNlcXVlbmNlTnVtYmVyICYmIG1pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlUmVjZWlwdC5TZXF1ZW5jZU51bWJlci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gdXBkYXRlIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBkcm9wcGVkIGludG8gdGhlIHRvcGljLCBhbmQgd2lsbCBiZSBwaWNrZWQgdXAgYnkgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiB1cGRhdGVzXG4gICAgICAgICAgICAgICAgICAgICAqIGFuZC9vciBub3RpZmljYXRpb25zIGNvbnN1bWVyLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE1pbGl0YXJ5IHZlcmlmaWNhdGlvbiB1cGRhdGUgc3VjY2Vzc2Z1bGx5IHNlbnQgdG8gdG9waWMgZm9yIHByb2Nlc3Npbmcgd2l0aCByZWNlaXB0IGluZm9ybWF0aW9uOiAke21pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlUmVjZWlwdC5NZXNzYWdlSWR9ICR7bWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVSZWNlaXB0LlNlcXVlbmNlTnVtYmVyfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYE1pbGl0YXJ5IHZlcmlmaWNhdGlvbiB1cGRhdGUgYWNrbm93bGVkZ2VkIWBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZW5kaW5nIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gdXBkYXRlIG1lc3NhZ2UgZnVydGhlciFgO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCBzZW5kaW5nIHRoZSBtZXNzYWdlIHRvIHRoZSB0b3BpYy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MjQsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVucHJvY2Vzc2FibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBzdGF0dXMgdHJhbnNpdGlvbiBpcyBub3QgdmFsaWQsIHRoZW4gcmV0dXJuIGEgbm9uLXByb2Nlc3NhYmxlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyB0cmFuc2l0aW9uIGZvciBub3RpZmljYXRpb24gcHJvY2VzcyB0byBnZXQgdHJpZ2dlcmVkIWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHNlbmRpbmcgdGhlIG1lc3NhZ2UgdG8gdGhlIHRvcGljLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgcmVxdWVzdCBib2R5IGlzIG51bGwsIHJldHVybiBhIHZhbGlkYXRpb24gZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlcXVlc3QgYm9keSBwYXNzZWQgaW4uYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXF1ZXN0Qm9keX1gKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgJHtyb3V0ZX0gcmVxdWVzdGA7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJvcn1gKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=