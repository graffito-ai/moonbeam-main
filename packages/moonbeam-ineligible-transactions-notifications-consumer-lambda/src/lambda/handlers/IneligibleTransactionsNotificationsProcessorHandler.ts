import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {
    CreateNotificationResponse,
    IneligibleTransaction,
    IneligibleTransactionResponse,
    MemberDetailsResponse,
    MoonbeamClient,
    NotificationChannelType,
    NotificationStatus,
    NotificationType,
    OliveClient,
    TransactionsErrorType,
    TransactionType,
    UserDevicesResponse,
    UserDeviceState
} from "@moonbeam/moonbeam-models";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";

/**
 * IneligibleTransactionNotificationsProcessor handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the ineligible notifications
 * transactions message information.
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processIneligibleTransactionsNotifications = async (event: SQSEvent): Promise<SQSBatchResponse> => {
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

        // for each record in the incoming event, repeat the ineligible notifications transactions processing steps
        for (const ineligibleTransactionalRecord of event.Records) {
            /**
             * The overall ineligible notifications transactions processing, will be made up of the following steps:
             *
             * 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
             * 2) Check to see if the ineligible transaction is of type OLIVE_INELIGIBLE_MATCHED, if it is, proceed to
             * Step 3, otherwise if it is of type OLIVE_INELIGIBLE_UNMATCHED go to Step 4. For any other types we do not
             * process the notification.
             * 3) Call the GET brand details Olive API to retrieve the brand name for incoming transaction.
             * 4) Call the getDevicesForUser Moonbeam AppSync API endpoint, to retrieve all physical devices associated with an
             * incoming user.
             * 5) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
             * 6) Call the createNotification Moonbeam AppSync API endpoint, to store the ineligible transaction notification in Dynamo DB
             * and send the notification through Courier accordingly.
             */
                // first, convert the incoming event message body, into an ineligible transaction object
            const ineligibleTransaction: IneligibleTransaction = JSON.parse(ineligibleTransactionalRecord.body) as IneligibleTransaction;

            // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
            const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

            // 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
            const memberDetailsResponse: MemberDetailsResponse = await getMemberDetails(oliveClient, ineligibleTransaction.memberId);

            // check to see if the member details call was successful or not
            if (memberDetailsResponse && !memberDetailsResponse.errorMessage && !memberDetailsResponse.errorType && memberDetailsResponse.data) {
                // set the transaction id, to be the userID mapped to the extMemberId retrieved from the member details call
                ineligibleTransaction.id = memberDetailsResponse.data;

                /**
                 * flag to see if we can proceed with the next Steps (3 and 4). We default this to true so in case of
                 * ineligible transactions of type OLIVE_INELIGIBLE_UNMATCHED we can just skip Step 3 and just go to
                 * Step 4, 5 followed by 6.
                 */
                let canProceed: boolean = true;

                /**
                 * 2) Check to see if the ineligible transaction is of type OLIVE_INELIGIBLE_MATCHED, if it is, proceed to
                 * Step 3, otherwise if it is of type OLIVE_INELIGIBLE_UNMATCHED go to Step 4. For any other types we do not
                 * process the notification.
                 */
                if (ineligibleTransaction.transactionType === TransactionType.OliveIneligibleMatched) {
                    // 3) Call the GET brand details Olive API to retrieve the brand name for incoming transaction
                    const brandDetailsResponse: IneligibleTransactionResponse = await getBrandDetails(oliveClient, ineligibleTransaction);

                    // check to see if the brand details call was successful or not
                    if (brandDetailsResponse && !brandDetailsResponse.errorMessage && !brandDetailsResponse.errorType && brandDetailsResponse.data) {
                        // determine if we can proceed, accordingly
                        canProceed = true;
                    } else {
                        console.log(`Brand Details mapping through GET brand details call failed`);

                        // determine if we can proceed, accordingly
                        canProceed = false;

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: ineligibleTransactionalRecord.messageId
                        });
                    }
                }

                // ensure we can proceed with Steps 4, 5 and 6 in case there are no errors
                if (canProceed) {
                    // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
                    const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

                    /**
                     * 4) Call the getDevicesForUser Moonbeam AppSync API endpoint, to retrieve all physical devices associated with an
                     * incoming user.
                     */
                    const devicesForUserResponse: UserDevicesResponse = await moonbeamClient.getDevicesForUser({
                        id: ineligibleTransaction.id
                    });

                    // check to see if the get devices for user call was successful or not
                    if (devicesForUserResponse && !devicesForUserResponse.errorMessage && !devicesForUserResponse.errorType &&
                        devicesForUserResponse.data && devicesForUserResponse.data.length !== 0) {

                        // 5) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
                        const deviceTokenIds: string[] = [];
                        for (const userDevice of devicesForUserResponse.data) {
                            userDevice!.deviceState === UserDeviceState.Active && deviceTokenIds.push(userDevice!.tokenId);
                        }

                        // if there are user associated physical devices that are active, to send notifications to, then proceed accordingly
                        if (deviceTokenIds.length !== 0) {
                            /**
                             * 6) Call the createNotification Moonbeam AppSync API endpoint, to store the ineligible transaction notification in Dynamo DB
                             * and send the notification through Courier accordingly.
                             */
                            const createNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                                id: ineligibleTransaction.id,
                                type: NotificationType.IneligibleTransaction,
                                channelType: NotificationChannelType.Push,
                                expoPushTokens: deviceTokenIds,
                                merchantName: ineligibleTransaction.transactionBrandName, // need to retrieve this through a call
                                ineligibleTransactionAmount: 0.01, // this is a set amount that we give for ineligible transactions
                                status: NotificationStatus.Sent
                            });

                            // check to see if the notifications call was successful or not
                            if (createNotificationResponse && !createNotificationResponse.errorMessage && !createNotificationResponse.errorType && createNotificationResponse.data) {
                                console.log(`Notification event successfully processed, with notification id ${createNotificationResponse.data.notificationId}`);
                            } else {
                                console.log(`Notification event through Create Notification call failed`);

                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: ineligibleTransactionalRecord.messageId
                                });
                            }
                        }
                    } else {
                        console.log(`Physical Devices mapping through GET devices for user call failed`);

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: ineligibleTransactionalRecord.messageId
                        });
                    }
                }
            } else {
                console.log(`UserID mapping through GET member details call failed`);

                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: ineligibleTransactionalRecord.messageId
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
        console.log(`Unexpected error while processing ${JSON.stringify(event)} ineligible transaction notification event ${error}`);

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

/**
 * Function used to retrieve the member details of a user, which includes the extMemberId
 * of a member, directly mapped to a Moonbeam userId, to be used when storing a transaction.
 *
 * @param oliveClient client used to make Olive API calls
 * @param memberId the id of the member, obtained from Olive through the transaction message,
 * which details are retrieved for
 *
 * @returns a {@link Promise} of {@link MemberDetailsResponse} representing the details of a member
 * in the form of either an error, or a valid string-based response signifying the member's external id
 */
const getMemberDetails = async (oliveClient: OliveClient, memberId: string): Promise<MemberDetailsResponse> => {
    // execute the member details retrieval call, in order to get the Moonbeam userId to be used in associating a transaction with a Moonbeam user
    const response: MemberDetailsResponse = await oliveClient.getMemberDetails(memberId);

    // check to see if the member details call was executed successfully
    if (response && !response.errorMessage && !response.errorType && response.data && response.data.length !== 0) {
        // returns the response data with the member's external ID, to be mapped to Moonbeam's userId
        return {
            data: response.data
        }
    } else {
        const errorMessage = `Unexpected response structure returned from the member details call!`;
        console.log(errorMessage);

        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        }
    }
}

/**
 * Function used to retrieve the brand details, which mainly include the name, logo and description
 * of the brand that the transaction was executed at, to be used when storing the ineligible transaction
 * in the DB.
 *
 * @param oliveClient client used to make Olive API calls
 * @param ineligibleTransaction the ineligible transaction object obtained from Olive through the ineligible transaction
 * message, which brand details obtained through this call are appended to.
 *
 * @returns a {@link Promise} of {@link IneligibleTransactionResponse} representing the ineligible transaction information
 * passed in through the SQS message, alongside the brand details retrieved through this call.
 */
const getBrandDetails = async (oliveClient: OliveClient, ineligibleTransaction: IneligibleTransaction): Promise<IneligibleTransactionResponse> => {
    // execute the brand details retrieval call, in order to get the brand details for the incoming ineligible transaction
    const response: IneligibleTransactionResponse = await oliveClient.getIneligibleBrandDetails(ineligibleTransaction);

    // check to see if the brand details call was executed successfully
    if (response && !response.errorMessage && !response.errorType && response.data &&
        response.data.transactionBrandName && response.data.transactionBrandName.length !== 0 &&
        response.data.transactionBrandLogoUrl && response.data.transactionBrandLogoUrl.length !== 0 &&
        response.data.transactionBrandURLAddress && response.data.transactionBrandURLAddress.length !== 0) {
        // returns the updated transaction data
        return {
            data: response.data
        }
    } else {
        const errorMessage = `Unexpected response structure returned from the brand details call!`;
        console.log(errorMessage);

        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        }
    }
}
