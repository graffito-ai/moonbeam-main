import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {
    CreateNotificationResponse,
    MoonbeamClient,
    NotificationChannelType, NotificationStatus,
    NotificationType,
    Transaction,
    UserDevicesResponse,
    UserDeviceState
} from "@moonbeam/moonbeam-models";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";

/**
 * OfferRedeemedNotificationProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processOfferRedeemedTransactionNotifications = async (event: SQSEvent): Promise<SQSBatchResponse> => {
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

        // for each record in the incoming event, repeat the transaction notification processing steps
        for (const transactionalRecord of event.Records) {
            /**
             * The overall transaction notification processing, will be made up of the following steps:
             *
             * 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
             * 2) Call the getDevicesForUser Moonbeam AppSync API endpoint, to retrieve all physical devices associated with an
             * incoming user.
             * 3) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
             * 4) Call the createNotification Moonbeam AppSync API endpoint, to store the notification transaction in Dynamo DB
             * and send the notification through Courier accordingly.
             */
                // first, convert the incoming event message body, into a transaction object
            const transaction: Transaction = JSON.parse(transactionalRecord.body) as Transaction;
            // need to use get member details here insteasd
            transaction.id = '890fb4de-cf9c-4efe-8c13-2ffb21b7913e';

            // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
            const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

            // 1) Call the getDevicesForUser Moonbeam Appsync API endpoint (need to add this in the internal Moonbeam Client first).
            const devicesForUserResponse: UserDevicesResponse = await moonbeamClient.getDevicesForUser({
                id: transaction.id
            });

            // check to see if the get devices for user call was successful or not
            if (devicesForUserResponse && !devicesForUserResponse.errorMessage && !devicesForUserResponse.errorType &&
                devicesForUserResponse.data && devicesForUserResponse.data.length !== 0) {

                // 2) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
                const deviceTokenIds: string[] = [];
                for (const userDevice of devicesForUserResponse.data) {
                    userDevice!.deviceState === UserDeviceState.Active && deviceTokenIds.push(userDevice!.tokenId);
                }

                // if there are user associated physical devices that are active, to send notifications to, then proceed accordingly
                if (deviceTokenIds.length !== 0) {
                    // 3) Call the createNotification Moonbeam AppSync API endpoint
                    const createNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                        id: transaction.id,
                        type: NotificationType.NewQualifyingOfferAvailable,
                        channelType: NotificationChannelType.Push,
                        expoPushTokens: deviceTokenIds,
                        merchantName: transaction.transactionBrandName,
                        pendingCashback: transaction.rewardAmount,
                        status: NotificationStatus.Sent
                    });

                    // check to see if the member details call was successful or not
                    if (createNotificationResponse && !createNotificationResponse.errorMessage && !createNotificationResponse.errorType && createNotificationResponse.data) {
                        console.log(`Notification event successfully processed, with notification id ${createNotificationResponse.data.notificationId}`);
                    } else {
                        console.log(`UserID mapping through GET member details call failed`);

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: transactionalRecord.messageId
                        });
                    }
                }

            } else {
                console.log(`Physical Devices mapping through GET devices for user call failed`);

                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: transactionalRecord.messageId
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
        console.log(`Unexpected error while processing ${JSON.stringify(event)} notification transactional event ${error}`);

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
