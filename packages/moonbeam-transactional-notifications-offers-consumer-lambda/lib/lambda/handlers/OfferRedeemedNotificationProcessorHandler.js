"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOfferRedeemedTransactionNotifications = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * OfferRedeemedNotificationProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processOfferRedeemedTransactionNotifications = async (event) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures = [];
        // for each record in the incoming event, repeat the transaction notification processing steps
        for (const transactionalRecord of event.Records) {
            /**
             * The overall transaction notification processing, will be made up of the following steps:
             *
             * 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
             * 2) Call the GET brand details Olive API to retrieve the brand name for incoming transaction
             * 3) Call the getDevicesForUser Moonbeam AppSync API endpoint, to retrieve all physical devices associated with an
             * incoming user.
             * 4) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
             * 5) Call the createNotification Moonbeam AppSync API endpoint, to store the notification transaction in Dynamo DB
             * and send the notification through Courier accordingly.
             */
            // first, convert the incoming event message body, into a transaction object
            const transaction = JSON.parse(transactionalRecord.body);
            // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
            // 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
            const memberDetailsResponse = await getMemberDetails(oliveClient, transaction.memberId);
            // check to see if the member details call was successful or not
            if (memberDetailsResponse && !memberDetailsResponse.errorMessage && !memberDetailsResponse.errorType && memberDetailsResponse.data) {
                // set the transaction id, to be the userID mapped to the extMemberId retrieved from the member details call
                transaction.id = memberDetailsResponse.data;
                // 2) Call the GET brand details Olive API to retrieve the brand name for incoming transaction
                const brandDetailsResponse = await getBrandDetails(oliveClient, transaction);
                // check to see if the brand details call was successful or not
                if (brandDetailsResponse && !brandDetailsResponse.errorMessage && !brandDetailsResponse.errorType && brandDetailsResponse.data) {
                    // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
                    const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
                    // 3) Call the getDevicesForUser Moonbeam Appsync API endpoint.
                    const devicesForUserResponse = await moonbeamClient.getDevicesForUser({
                        id: transaction.id
                    });
                    // check to see if the get devices for user call was successful or not
                    if (devicesForUserResponse && !devicesForUserResponse.errorMessage && !devicesForUserResponse.errorType &&
                        devicesForUserResponse.data && devicesForUserResponse.data.length !== 0) {
                        // 4) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
                        const deviceTokenIds = [];
                        for (const userDevice of devicesForUserResponse.data) {
                            userDevice.deviceState === moonbeam_models_1.UserDeviceState.Active && deviceTokenIds.push(userDevice.tokenId);
                        }
                        // if there are user associated physical devices that are active, to send notifications to, then proceed accordingly
                        if (deviceTokenIds.length !== 0) {
                            // 5) Call the createNotification Moonbeam AppSync API endpoint
                            const createNotificationResponse = await moonbeamClient.createNotification({
                                id: transaction.id,
                                type: moonbeam_models_1.NotificationType.NewQualifyingOfferAvailable,
                                channelType: moonbeam_models_1.NotificationChannelType.Push,
                                expoPushTokens: deviceTokenIds,
                                merchantName: transaction.transactionBrandName,
                                pendingCashback: transaction.rewardAmount,
                                status: moonbeam_models_1.NotificationStatus.Sent
                            });
                            // check to see if the notifications call was successful or not
                            if (createNotificationResponse && !createNotificationResponse.errorMessage && !createNotificationResponse.errorType && createNotificationResponse.data) {
                                console.log(`Notification event successfully processed, with notification id ${createNotificationResponse.data.notificationId}`);
                            }
                            else {
                                console.log(`Notification event through Create Notification call failed`);
                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: transactionalRecord.messageId
                                });
                            }
                        }
                    }
                    else {
                        console.log(`Physical Devices mapping through GET devices for user call failed`);
                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: transactionalRecord.messageId
                        });
                    }
                }
                else {
                    console.log(`Brand Details mapping through GET brand details call failed`);
                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: transactionalRecord.messageId
                    });
                }
            }
            else {
                console.log(`UserID mapping through GET member details call failed`);
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
        };
    }
    catch (error) {
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
        };
    }
};
exports.processOfferRedeemedTransactionNotifications = processOfferRedeemedTransactionNotifications;
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
const getMemberDetails = async (oliveClient, memberId) => {
    // execute the member details retrieval call, in order to get the Moonbeam userId to be used in associating a transaction with a Moonbeam user
    const response = await oliveClient.getMemberDetails(memberId);
    // check to see if the member details call was executed successfully
    if (response && !response.errorMessage && !response.errorType && response.data && response.data.length !== 0) {
        // returns the response data with the member's external ID, to be mapped to Moonbeam's userId
        return {
            data: response.data
        };
    }
    else {
        const errorMessage = `Unexpected response structure returned from the member details call!`;
        console.log(errorMessage);
        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        };
    }
};
/**
 * Function used to retrieve the brand details, which mainly include the name, logo and description
 * of the brand that the transaction was executed at, to be used when storing the transaction in the DB.
 *
 * @param oliveClient client used to make Olive API calls
 * @param transaction the transaction object obtained from Olive through the transaction message,
 * which brand details obtained through this call are appended to
 *
 * @returns a {@link Promise} of {@link TransactionResponse} representing the transaction information passed
 * in through the SQS message, alongside the brand details retrieved through this call.
 */
const getBrandDetails = async (oliveClient, transaction) => {
    // execute the brand details retrieval call, in order to get the brand details for the incoming transaction
    const response = await oliveClient.getBrandDetails(transaction);
    // check to see if the brand details call was executed successfully
    if (response && !response.errorMessage && !response.errorType && response.data &&
        response.data.transactionBrandName && response.data.transactionBrandName.length !== 0 &&
        response.data.transactionBrandLogoUrl && response.data.transactionBrandLogoUrl.length !== 0 &&
        response.data.transactionBrandURLAddress && response.data.transactionBrandURLAddress.length !== 0) {
        // returns the updated transaction data
        return {
            data: response.data
        };
    }
    else {
        const errorMessage = `Unexpected response structure returned from the brand details call!`;
        console.log(errorMessage);
        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2ZmZXJSZWRlZW1lZE5vdGlmaWNhdGlvblByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL09mZmVyUmVkZWVtZWROb3RpZmljYXRpb25Qcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQVFtQztBQUduQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLDRDQUE0QyxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDN0csSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsOEZBQThGO1FBQzlGLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdDOzs7Ozs7Ozs7O2VBVUc7WUFDQyw0RUFBNEU7WUFDaEYsTUFBTSxXQUFXLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFnQixDQUFDO1lBRXJGLG9HQUFvRztZQUNwRyxNQUFNLFdBQVcsR0FBRyxJQUFJLDZCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFbkUsbUdBQW1HO1lBQ25HLE1BQU0scUJBQXFCLEdBQTBCLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUvRyxnRUFBZ0U7WUFDaEUsSUFBSSxxQkFBcUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hJLDRHQUE0RztnQkFDNUcsV0FBVyxDQUFDLEVBQUUsR0FBRyxxQkFB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QixDQUFDLGVBQWU7WUFDaEQsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTUVNCYXRjaFJlc3BvbnNlLCBTUVNFdmVudH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7XG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UsIE1lbWJlckRldGFpbHNSZXNwb25zZSxcbiAgICBNb29uYmVhbUNsaWVudCxcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSwgTm90aWZpY2F0aW9uU3RhdHVzLFxuICAgIE5vdGlmaWNhdGlvblR5cGUsIE9saXZlQ2xpZW50LFxuICAgIFRyYW5zYWN0aW9uLCBUcmFuc2FjdGlvblJlc3BvbnNlLCBUcmFuc2FjdGlvbnNFcnJvclR5cGUsXG4gICAgVXNlckRldmljZXNSZXNwb25zZSxcbiAgICBVc2VyRGV2aWNlU3RhdGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7U1FTQmF0Y2hJdGVtRmFpbHVyZX0gZnJvbSBcImF3cy1sYW1iZGEvdHJpZ2dlci9zcXNcIjtcblxuLyoqXG4gKiBPZmZlclJlZGVlbWVkTm90aWZpY2F0aW9uUHJvY2Vzc29ySGFuZGxlciBoYW5kbGVyXG4gKlxuICogQHBhcmFtIGV2ZW50IHRoZSB7QGxpbmsgU1FTRXZlbnR9IHRvIGJlIHByb2Nlc3NlZCwgY29udGFpbmluZyB0aGUgdHJhbnNhY3Rpb25cbiAqIG1lc3NhZ2UgaW5mb3JtYXRpb25cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgU1FTQmF0Y2hSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHByb2Nlc3NPZmZlclJlZGVlbWVkVHJhbnNhY3Rpb25Ob3RpZmljYXRpb25zID0gYXN5bmMgKGV2ZW50OiBTUVNFdmVudCk6IFByb21pc2U8U1FTQmF0Y2hSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpbml0aWFsaXppbmcgdGhlIGJhdGNoIHJlc3BvbnNlLCBhcyBhbiBlbXB0eSBhcnJheSwgdGhhdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGVycm9ycywgaWYgYW55IHRocm91Z2hvdXQgdGhlIHByb2Nlc3NpbmdcbiAgICAgICAgICpcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5LiBJZiB3ZSB3YW50IHRvIGluZGljYXRlIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIGVycm9ycyxcbiAgICAgICAgICogZm9yIGVhY2ggaW5kaXZpZHVhbCBtZXNzYWdlLCBiYXNlZCBvbiBpdHMgSUQsIHdlIGhhdmUgdG8gYWRkIGl0IGluIHRoZSBmaW5hbCBiYXRjaCByZXNwb25zZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpdGVtRmFpbHVyZXM6IFNRU0JhdGNoSXRlbUZhaWx1cmVbXSA9IFtdO1xuXG4gICAgICAgIC8vIGZvciBlYWNoIHJlY29yZCBpbiB0aGUgaW5jb21pbmcgZXZlbnQsIHJlcGVhdCB0aGUgdHJhbnNhY3Rpb24gbm90aWZpY2F0aW9uIHByb2Nlc3Npbmcgc3RlcHNcbiAgICAgICAgZm9yIChjb25zdCB0cmFuc2FjdGlvbmFsUmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG92ZXJhbGwgdHJhbnNhY3Rpb24gbm90aWZpY2F0aW9uIHByb2Nlc3NpbmcsIHdpbGwgYmUgbWFkZSB1cCBvZiB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIDEpIENhbGwgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIChleHRNZW1iZXJJRCkgZm9yIG1lbWJlclxuICAgICAgICAgICAgICogMikgQ2FsbCB0aGUgR0VUIGJyYW5kIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBuYW1lIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICogMykgQ2FsbCB0aGUgZ2V0RGV2aWNlc0ZvclVzZXIgTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHJldHJpZXZlIGFsbCBwaHlzaWNhbCBkZXZpY2VzIGFzc29jaWF0ZWQgd2l0aCBhblxuICAgICAgICAgICAgICogaW5jb21pbmcgdXNlci5cbiAgICAgICAgICAgICAqIDQpIEZpbHRlciBvYnRhaW5lZCBkZXZpY2VzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cyAob25seSBjb25zaWRlciB0aGUgb25lcyB0aGF0IGFyZSBBQ1RJVkUgZm9yIHRoZSB1c2VyKS5cbiAgICAgICAgICAgICAqIDUpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgdG8gc3RvcmUgdGhlIG5vdGlmaWNhdGlvbiB0cmFuc2FjdGlvbiBpbiBEeW5hbW8gREJcbiAgICAgICAgICAgICAqIGFuZCBzZW5kIHRoZSBub3RpZmljYXRpb24gdGhyb3VnaCBDb3VyaWVyIGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QsIGNvbnZlcnQgdGhlIGluY29taW5nIGV2ZW50IG1lc3NhZ2UgYm9keSwgaW50byBhIHRyYW5zYWN0aW9uIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0gSlNPTi5wYXJzZSh0cmFuc2FjdGlvbmFsUmVjb3JkLmJvZHkpIGFzIFRyYW5zYWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIDEpIENhbGwgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIChleHRNZW1iZXJJRCkgZm9yIG1lbWJlclxuICAgICAgICAgICAgY29uc3QgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlOiBNZW1iZXJEZXRhaWxzUmVzcG9uc2UgPSBhd2FpdCBnZXRNZW1iZXJEZXRhaWxzKG9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbi5tZW1iZXJJZCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgIGlmIChtZW1iZXJEZXRhaWxzUmVzcG9uc2UgJiYgIW1lbWJlckRldGFpbHNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIW1lbWJlckRldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHRyYW5zYWN0aW9uIGlkLCB0byBiZSB0aGUgdXNlcklEIG1hcHBlZCB0byB0aGUgZXh0TWVtYmVySWQgcmV0cmlldmVkIGZyb20gdGhlIG1lbWJlciBkZXRhaWxzIGNhbGxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5pZCA9IG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhO1xuXG4gICAgICAgICAgICAgICAgLy8gMikgQ2FsbCB0aGUgR0VUIGJyYW5kIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBuYW1lIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IGJyYW5kRGV0YWlsc1Jlc3BvbnNlOiBUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgZ2V0QnJhbmREZXRhaWxzKG9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGJyYW5kIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAoYnJhbmREZXRhaWxzUmVzcG9uc2UgJiYgIWJyYW5kRGV0YWlsc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYnJhbmREZXRhaWxzUmVzcG9uc2UuZXJyb3JUeXBlICYmIGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gMykgQ2FsbCB0aGUgZ2V0RGV2aWNlc0ZvclVzZXIgTW9vbmJlYW0gQXBwc3luYyBBUEkgZW5kcG9pbnQuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZXNGb3JVc2VyUmVzcG9uc2U6IFVzZXJEZXZpY2VzUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5nZXREZXZpY2VzRm9yVXNlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdHJhbnNhY3Rpb24uaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgZGV2aWNlcyBmb3IgdXNlciBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlc0ZvclVzZXJSZXNwb25zZSAmJiAhZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA0KSBGaWx0ZXIgb2J0YWluZWQgZGV2aWNlcyBiYXNlZCBvbiB0aGVpciBzdGF0dXMgKG9ubHkgY29uc2lkZXIgdGhlIG9uZXMgdGhhdCBhcmUgQUNUSVZFIGZvciB0aGUgdXNlcikuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VUb2tlbklkczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdXNlckRldmljZSBvZiBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV2aWNlIS5kZXZpY2VTdGF0ZSA9PT0gVXNlckRldmljZVN0YXRlLkFjdGl2ZSAmJiBkZXZpY2VUb2tlbklkcy5wdXNoKHVzZXJEZXZpY2UhLnRva2VuSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgdXNlciBhc3NvY2lhdGVkIHBoeXNpY2FsIGRldmljZXMgdGhhdCBhcmUgYWN0aXZlLCB0byBzZW5kIG5vdGlmaWNhdGlvbnMgdG8sIHRoZW4gcHJvY2VlZCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRldmljZVRva2VuSWRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDUpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZU5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0cmFuc2FjdGlvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZS5OZXdRdWFsaWZ5aW5nT2ZmZXJBdmFpbGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5QdXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2VuczogZGV2aWNlVG9rZW5JZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZTogdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25CcmFuZE5hbWUsIC8vIG5lZWQgdG8gcmV0cmlldmUgdGhpcyB0aHJvdWdoIGEgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2s6IHRyYW5zYWN0aW9uLnJld2FyZEFtb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBOb3RpZmljYXRpb25TdGF0dXMuU2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBub3RpZmljYXRpb25zIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlICYmICFjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSAmJiBjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RpZmljYXRpb24gZXZlbnQgc3VjY2Vzc2Z1bGx5IHByb2Nlc3NlZCwgd2l0aCBub3RpZmljYXRpb24gaWQgJHtjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhLm5vdGlmaWNhdGlvbklkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RpZmljYXRpb24gZXZlbnQgdGhyb3VnaCBDcmVhdGUgTm90aWZpY2F0aW9uIGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiB0cmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUGh5c2ljYWwgRGV2aWNlcyBtYXBwaW5nIHRocm91Z2ggR0VUIGRldmljZXMgZm9yIHVzZXIgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCcmFuZCBEZXRhaWxzIG1hcHBpbmcgdGhyb3VnaCBHRVQgYnJhbmQgZGV0YWlscyBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXNlcklEIG1hcHBpbmcgdGhyb3VnaCBHRVQgbWVtYmVyIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5IGhlcmUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiYXRjaEl0ZW1GYWlsdXJlczogaXRlbUZhaWx1cmVzXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQpfSBub3RpZmljYXRpb24gdHJhbnNhY3Rpb25hbCBldmVudCAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm5zIGEgYmF0Y2ggcmVzcG9uc2UgZmFpbHVyZSBmb3IgdGhlIHBhcnRpY3VsYXIgbWVzc2FnZSBJRHMgd2hpY2ggZmFpbGVkXG4gICAgICAgICAqIGluIHRoaXMgY2FzZSwgdGhlIExhbWJkYSBmdW5jdGlvbiBET0VTIE5PVCBkZWxldGUgdGhlIGluY29taW5nIG1lc3NhZ2VzIGZyb20gdGhlIHF1ZXVlLCBhbmQgaXQgbWFrZXMgaXQgYXZhaWxhYmxlL3Zpc2libGUgYWdhaW5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBbe1xuICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGNhc2UsIHdlIG9ubHkgcHJvY2VzcyAxIHJlY29yZCBhdCBhIHRpbWUsIHdlIG1pZ2h0IG5lZWQgdG8gY2hhbmdlIHRoaXMgaW4gdGhlIGZ1dHVyZVxuICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBldmVudC5SZWNvcmRzWzBdLm1lc3NhZ2VJZFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBtZW1iZXIgZGV0YWlscyBvZiBhIHVzZXIsIHdoaWNoIGluY2x1ZGVzIHRoZSBleHRNZW1iZXJJZFxuICogb2YgYSBtZW1iZXIsIGRpcmVjdGx5IG1hcHBlZCB0byBhIE1vb25iZWFtIHVzZXJJZCwgdG8gYmUgdXNlZCB3aGVuIHN0b3JpbmcgYSB0cmFuc2FjdGlvbi5cbiAqXG4gKiBAcGFyYW0gb2xpdmVDbGllbnQgY2xpZW50IHVzZWQgdG8gbWFrZSBPbGl2ZSBBUEkgY2FsbHNcbiAqIEBwYXJhbSBtZW1iZXJJZCB0aGUgaWQgb2YgdGhlIG1lbWJlciwgb2J0YWluZWQgZnJvbSBPbGl2ZSB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlLFxuICogd2hpY2ggZGV0YWlscyBhcmUgcmV0cmlldmVkIGZvclxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNZW1iZXJEZXRhaWxzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgZGV0YWlscyBvZiBhIG1lbWJlclxuICogaW4gdGhlIGZvcm0gb2YgZWl0aGVyIGFuIGVycm9yLCBvciBhIHZhbGlkIHN0cmluZy1iYXNlZCByZXNwb25zZSBzaWduaWZ5aW5nIHRoZSBtZW1iZXIncyBleHRlcm5hbCBpZFxuICovXG5jb25zdCBnZXRNZW1iZXJEZXRhaWxzID0gYXN5bmMgKG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgbWVtYmVySWQ6IHN0cmluZyk6IFByb21pc2U8TWVtYmVyRGV0YWlsc1Jlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgbWVtYmVyIGRldGFpbHMgcmV0cmlldmFsIGNhbGwsIGluIG9yZGVyIHRvIGdldCB0aGUgTW9vbmJlYW0gdXNlcklkIHRvIGJlIHVzZWQgaW4gYXNzb2NpYXRpbmcgYSB0cmFuc2FjdGlvbiB3aXRoIGEgTW9vbmJlYW0gdXNlclxuICAgIGNvbnN0IHJlc3BvbnNlOiBNZW1iZXJEZXRhaWxzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRNZW1iZXJEZXRhaWxzKG1lbWJlcklkKTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHJldHVybnMgdGhlIHJlc3BvbnNlIGRhdGEgd2l0aCB0aGUgbWVtYmVyJ3MgZXh0ZXJuYWwgSUQsIHRvIGJlIG1hcHBlZCB0byBNb29uYmVhbSdzIHVzZXJJZFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIG1lbWJlciBkZXRhaWxzIGNhbGwhYDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBicmFuZCBkZXRhaWxzLCB3aGljaCBtYWlubHkgaW5jbHVkZSB0aGUgbmFtZSwgbG9nbyBhbmQgZGVzY3JpcHRpb25cbiAqIG9mIHRoZSBicmFuZCB0aGF0IHRoZSB0cmFuc2FjdGlvbiB3YXMgZXhlY3V0ZWQgYXQsIHRvIGJlIHVzZWQgd2hlbiBzdG9yaW5nIHRoZSB0cmFuc2FjdGlvbiBpbiB0aGUgREIuXG4gKlxuICogQHBhcmFtIG9saXZlQ2xpZW50IGNsaWVudCB1c2VkIHRvIG1ha2UgT2xpdmUgQVBJIGNhbGxzXG4gKiBAcGFyYW0gdHJhbnNhY3Rpb24gdGhlIHRyYW5zYWN0aW9uIG9iamVjdCBvYnRhaW5lZCBmcm9tIE9saXZlIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UsXG4gKiB3aGljaCBicmFuZCBkZXRhaWxzIG9idGFpbmVkIHRocm91Z2ggdGhpcyBjYWxsIGFyZSBhcHBlbmRlZCB0b1xuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uIGluZm9ybWF0aW9uIHBhc3NlZFxuICogaW4gdGhyb3VnaCB0aGUgU1FTIG1lc3NhZ2UsIGFsb25nc2lkZSB0aGUgYnJhbmQgZGV0YWlscyByZXRyaWV2ZWQgdGhyb3VnaCB0aGlzIGNhbGwuXG4gKi9cbmNvbnN0IGdldEJyYW5kRGV0YWlscyA9IGFzeW5jIChvbGl2ZUNsaWVudDogT2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbik6IFByb21pc2U8VHJhbnNhY3Rpb25SZXNwb25zZT4gPT4ge1xuICAgIC8vIGV4ZWN1dGUgdGhlIGJyYW5kIGRldGFpbHMgcmV0cmlldmFsIGNhbGwsIGluIG9yZGVyIHRvIGdldCB0aGUgYnJhbmQgZGV0YWlscyBmb3IgdGhlIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgY29uc3QgcmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRCcmFuZERldGFpbHModHJhbnNhY3Rpb24pO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBicmFuZCBkZXRhaWxzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmROYW1lICYmIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZE5hbWUubGVuZ3RoICE9PSAwICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZExvZ29VcmwgJiYgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTG9nb1VybC5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzcyAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAvLyByZXR1cm5zIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGRhdGFcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBicmFuZCBkZXRhaWxzIGNhbGwhYDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==