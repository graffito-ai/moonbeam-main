import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    CountryCode,
    CreateLocationBasedOfferReminderInput,
    CreateNotificationResponse,
    GetNotificationByTypeResponse,
    MoonbeamClient,
    NotificationChannelType, NotificationStatus,
    NotificationType,
    OfferAvailability,
    OfferFilter,
    OffersResponse,
    OfferState,
    OliveClient,
    RedemptionType
} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from 'uuid';

/**
 * LocationUpdatesProcessor handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the location-based update
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processLocationUpdates = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures: SQSBatchItemFailure[] = [];

        // first, initialize the Moonbeam and Olive Client APIs here, in order to call the appropriate endpoints for these handlers.
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

        // for each record in the incoming event, repeat the location-based update/notification steps
        for (const locationUpdateRecord of event.Records) {
            // first, convert the incoming event message body, into a CreateLocationBasedOfferReminderInput object
            const locationBasedOfferReminderInput: CreateLocationBasedOfferReminderInput = JSON.parse(locationUpdateRecord.body) as CreateLocationBasedOfferReminderInput;

            /**
             * The overall location-based update/notification event processing, will be made up of the following steps:
             *
             * 1) Call the getOffers Moonbeam AppSync API endpoint, to retrieve all nearby offers given the particular
             * incoming location update coordinates (lat + long).
             * 2) If there are no offers available nearby, then do nothing. Otherwise, call the getNotificationByType
             * Moonbeam AppSync API endpoint, to retrieve the location-based notifications which were sent to all users
             * in the past 4 hours.
             * 3) If there are no location-based notifications sent in the past 4 hours OR if amongst any location-based
             * notifications sent in the past 4 hours, there were none sent the incoming expo push token received through
             * the location-update, then call the createNotification Moonbeam AppSync API endpoint to send a push notification.
             */

            /**
             * 1) Call the getOffers Moonbeam AppSync API endpoint, to retrieve all nearby offers given the particular
             * incoming location update coordinates (lat + long).
             */
            const availableNearbyOffersResponse: OffersResponse = await oliveClient.getOffers({
                availability: OfferAvailability.All,
                countryCode: CountryCode.Us,
                filterType: OfferFilter.Nearby,
                offerStates: [OfferState.Active, OfferState.Scheduled],
                pageNumber: 1,
                pageSize: 1,
                radius: 250, // search within 250 meters
                radiusIncludeOnlineStores: false,
                radiusLatitude: Number(locationBasedOfferReminderInput.latitude),
                radiusLongitude: Number(locationBasedOfferReminderInput.longitude),
                redemptionType: RedemptionType.All,
            });

            // check to see if the offers call was successfully made, and if there are any available offers nearby
            if (availableNearbyOffersResponse && !availableNearbyOffersResponse.errorMessage && !availableNearbyOffersResponse.errorType &&
                availableNearbyOffersResponse.data !== undefined && availableNearbyOffersResponse.data !== null) {
                // check to see if there are any available offers nearby, if not then we do not proceed
                if (availableNearbyOffersResponse.data.offers !== undefined && availableNearbyOffersResponse.data.offers !== null &&
                    availableNearbyOffersResponse.data.offers.length !== 0) {
                    /**
                     * 2) Call the getNotificationByType Moonbeam AppSync API endpoint, to retrieve the location-based notifications which were
                     * sent to all users in the past 4 hours.
                     */
                    const endDate = new Date();

                    // set 4 hours before now, 00 min, 00 seconds, 001 milliseconds as the end date
                    endDate.setHours(new Date().getHours() - 4);
                    endDate.setMinutes(0);
                    endDate.setSeconds(0);
                    endDate.setMilliseconds(0);

                    const notificationByTypeResponse: GetNotificationByTypeResponse = await moonbeamClient.getNotificationByType({
                        type: NotificationType.LocationBasedOfferReminder,
                        endDate: endDate.toISOString()
                    });
                    // check to see if the retrieve notification by type call was successful or not
                    if (notificationByTypeResponse && !notificationByTypeResponse.errorMessage && !notificationByTypeResponse.errorType &&
                        notificationByTypeResponse.data !== undefined && notificationByTypeResponse.data !== null) {
                        // flag to indicate whether we need to send a notification or not
                        let notificationNeeded: boolean = true;

                        // check to see if there have been no notifications sent in the past 4 hours to any user
                        if (notificationByTypeResponse.data.length == 0) {
                            notificationNeeded = true;
                        }
                        if (notificationByTypeResponse.data.length > 0) {
                            /**
                             * check to see if there have been notification sent in the past 4 hours, if they were sent to the incoming push token
                             * obtained from the location update.
                             */
                            notificationByTypeResponse.data.forEach(notification => {
                                if (notification !== null && notification.expoPushTokens !== undefined && notification.expoPushTokens !== null &&
                                    notification.expoPushTokens.length !== 0) {
                                    notification.expoPushTokens.forEach(pushToken => {
                                        if (pushToken === locationBasedOfferReminderInput.expoPushToken[0]) {
                                            notificationNeeded = false;
                                        }
                                    });
                                }
                            });
                        }

                        /**
                         * after we performed all the checks, if we determine that we do need to send a notification, then
                         * 3) call the createNotification Moonbeam AppSync API endpoint to send a push notification.
                         */
                        if (notificationNeeded) {
                            const brandName: string = (availableNearbyOffersResponse.data.offers !== undefined && availableNearbyOffersResponse.data.offers !== null &&
                                availableNearbyOffersResponse.data.offers.length !== 0 && availableNearbyOffersResponse.data.offers[0] !== undefined && availableNearbyOffersResponse.data.offers[0] !== null &&
                                availableNearbyOffersResponse.data.offers[0].brandDba !== undefined && availableNearbyOffersResponse.data.offers[0].brandDba !== null)
                                ? availableNearbyOffersResponse.data.offers[0].brandDba
                                : "Moonbeam Merchant";

                            const createNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                                channelType: NotificationChannelType.Push,
                                expoPushTokens: [locationBasedOfferReminderInput.expoPushToken[0]],
                                id: uuidv4(), // for these types of notifications we cannot match them to the particular user, so we just generate a random uuid
                                merchantName: brandName,
                                status: NotificationStatus.Sent,
                                type: NotificationType.LocationBasedOfferReminder
                            });
                            // check to see if the create notification call was successful or not
                            if (createNotificationResponse && !createNotificationResponse.errorMessage && !createNotificationResponse.errorType &&
                                createNotificationResponse.data !== undefined && createNotificationResponse.data !== null) {
                                console.log(`Notification successfully sent with id: ${createNotificationResponse.data.id} and notification id: ${createNotificationResponse.data.notificationId}`);
                            } else {
                                console.log(`Create notification call failed`);

                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: locationUpdateRecord.messageId
                                });
                            }
                        } else {
                            console.log('No notification needed for location update at the moment!');
                        }
                    } else {
                        console.log(`Retrieve notifications by type call failed`);

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: locationUpdateRecord.messageId
                        });
                    }
                } else {
                    console.log(`No available offers nearby incoming location {${locationBasedOfferReminderInput.latitude}, ${locationBasedOfferReminderInput.longitude}}`);
                }
            } else {
                console.log(`Available offers nearby call failed`);

                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: locationUpdateRecord.messageId
                });
            }
        }

        /**
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array here.
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: itemFailures
        }
    } catch (error) {
        console.log(`Unexpected error while processing ${JSON.stringify(event)} location update event ${error}`);

        /**
         * returns a batch response failure for the particular message IDs which failed
         * in this case, the Lambda function DOES NOT delete the incoming messages from the queue, and it makes it available/visible again
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: [{
                // for this case, we only process 1 record at a time, we might need to change this in the future
                itemIdentifier: event.Records[0].messageId
            }]
        }
    }
}
