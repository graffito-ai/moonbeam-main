import {
    CreateLocationBasedOfferReminderInput,
    LocationBasedOfferReminderResponse,
    NotificationsErrorType,
    NotificationStatus
} from "@moonbeam/moonbeam-models";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import {v4 as uuidv4} from 'uuid';

/**
 * AcknowledgeLocationUpdate resolver
 *
 * @param createLocationBasedOfferReminderInput the input needed to acknowledge a new location update
 * and/or acknowledge a location change.
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link LocationBasedOfferReminderResponse}
 */
export const acknowledgeLocationUpdate = async (fieldName: string, createLocationBasedOfferReminderInput: CreateLocationBasedOfferReminderInput): Promise<LocationBasedOfferReminderResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the SNS Client
        const snsClient = new SNSClient({region: region});

        /**
         * drop the location-based update input as a message to the location-based updates/notifications processing topic
         */
        const locationUpdateReceipt = await snsClient.send(new PublishCommand({
            TopicArn: process.env.LOCATION_BASED_REMINDERS_PROCESSING_TOPIC_ARN!,
            Message: JSON.stringify(createLocationBasedOfferReminderInput),
            /**
             * the message group id, will be represented by a unique uuid, so that we can group location-based update messages,
             * and sort them in the FIFO processing topic accordingly.
             */
            MessageGroupId: uuidv4()
        }));

        // ensure that the location-based updates/notification message was properly sent to the appropriate processing topic
        if (locationUpdateReceipt && locationUpdateReceipt.MessageId && locationUpdateReceipt.MessageId.length !== 0 &&
            locationUpdateReceipt.SequenceNumber && locationUpdateReceipt.SequenceNumber.length !== 0) {
            /**
             * the location-based update has been successfully dropped into the topic, and will be picked up by the location-based update consumer.
             */
            console.log(`Location-based update successfully sent to topic for processing with receipt information: ${locationUpdateReceipt.MessageId} ${locationUpdateReceipt.SequenceNumber}`);

            return {
                data: NotificationStatus.Acknowledged
            }
        } else {
            const errorMessage = `Unexpected error while sending the location-based update message further!`;
            console.log(errorMessage);

            /**
             * if there are errors associated with sending the message to the topic.
             */
            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationsErrorType.UnexpectedError
        }
    }
}
