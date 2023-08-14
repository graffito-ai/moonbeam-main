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
                    // 3) Call the getDevicesForUser Moonbeam Appsync API endpoint (need to add this in the internal Moonbeam Client first).
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
                            // check to see if the member details call was successful or not
                            if (createNotificationResponse && !createNotificationResponse.errorMessage && !createNotificationResponse.errorType && createNotificationResponse.data) {
                                console.log(`Notification event successfully processed, with notification id ${createNotificationResponse.data.notificationId}`);
                            }
                            else {
                                console.log(`UserID mapping through GET member details call failed`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2ZmZXJSZWRlZW1lZE5vdGlmaWNhdGlvblByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL09mZmVyUmVkZWVtZWROb3RpZmljYXRpb25Qcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQVFtQztBQUduQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLDRDQUE0QyxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDN0csSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsOEZBQThGO1FBQzlGLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdDOzs7Ozs7Ozs7O2VBVUc7WUFDQyw0RUFBNEU7WUFDaEYsTUFBTSxXQUFXLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFnQixDQUFDO1lBRXJGLG9HQUFvRztZQUNwRyxNQUFNLFdBQVcsR0FBRyxJQUFJLDZCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFbkUsbUdBQW1HO1lBQ25HLE1BQU0scUJBQXFCLEdBQTBCLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUvRyxnRUFBZ0U7WUFDaEUsSUFBSSxxQkFBcUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hJLDRHQUE0RztnQkFDNUcsV0FBVyxDQUFDLEVBQUUsR0FBRyxxQkFB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QixDQUFDLGVBQWU7WUFDaEQsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTUVNCYXRjaFJlc3BvbnNlLCBTUVNFdmVudH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7XG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UsIE1lbWJlckRldGFpbHNSZXNwb25zZSxcbiAgICBNb29uYmVhbUNsaWVudCxcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSwgTm90aWZpY2F0aW9uU3RhdHVzLFxuICAgIE5vdGlmaWNhdGlvblR5cGUsIE9saXZlQ2xpZW50LFxuICAgIFRyYW5zYWN0aW9uLCBUcmFuc2FjdGlvblJlc3BvbnNlLCBUcmFuc2FjdGlvbnNFcnJvclR5cGUsXG4gICAgVXNlckRldmljZXNSZXNwb25zZSxcbiAgICBVc2VyRGV2aWNlU3RhdGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7U1FTQmF0Y2hJdGVtRmFpbHVyZX0gZnJvbSBcImF3cy1sYW1iZGEvdHJpZ2dlci9zcXNcIjtcblxuLyoqXG4gKiBPZmZlclJlZGVlbWVkTm90aWZpY2F0aW9uUHJvY2Vzc29ySGFuZGxlciBoYW5kbGVyXG4gKlxuICogQHBhcmFtIGV2ZW50IHRoZSB7QGxpbmsgU1FTRXZlbnR9IHRvIGJlIHByb2Nlc3NlZCwgY29udGFpbmluZyB0aGUgdHJhbnNhY3Rpb25cbiAqIG1lc3NhZ2UgaW5mb3JtYXRpb25cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgU1FTQmF0Y2hSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHByb2Nlc3NPZmZlclJlZGVlbWVkVHJhbnNhY3Rpb25Ob3RpZmljYXRpb25zID0gYXN5bmMgKGV2ZW50OiBTUVNFdmVudCk6IFByb21pc2U8U1FTQmF0Y2hSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpbml0aWFsaXppbmcgdGhlIGJhdGNoIHJlc3BvbnNlLCBhcyBhbiBlbXB0eSBhcnJheSwgdGhhdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGVycm9ycywgaWYgYW55IHRocm91Z2hvdXQgdGhlIHByb2Nlc3NpbmdcbiAgICAgICAgICpcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5LiBJZiB3ZSB3YW50IHRvIGluZGljYXRlIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIGVycm9ycyxcbiAgICAgICAgICogZm9yIGVhY2ggaW5kaXZpZHVhbCBtZXNzYWdlLCBiYXNlZCBvbiBpdHMgSUQsIHdlIGhhdmUgdG8gYWRkIGl0IGluIHRoZSBmaW5hbCBiYXRjaCByZXNwb25zZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpdGVtRmFpbHVyZXM6IFNRU0JhdGNoSXRlbUZhaWx1cmVbXSA9IFtdO1xuXG4gICAgICAgIC8vIGZvciBlYWNoIHJlY29yZCBpbiB0aGUgaW5jb21pbmcgZXZlbnQsIHJlcGVhdCB0aGUgdHJhbnNhY3Rpb24gbm90aWZpY2F0aW9uIHByb2Nlc3Npbmcgc3RlcHNcbiAgICAgICAgZm9yIChjb25zdCB0cmFuc2FjdGlvbmFsUmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG92ZXJhbGwgdHJhbnNhY3Rpb24gbm90aWZpY2F0aW9uIHByb2Nlc3NpbmcsIHdpbGwgYmUgbWFkZSB1cCBvZiB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIDEpIENhbGwgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIChleHRNZW1iZXJJRCkgZm9yIG1lbWJlclxuICAgICAgICAgICAgICogMikgQ2FsbCB0aGUgR0VUIGJyYW5kIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBuYW1lIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICogMykgQ2FsbCB0aGUgZ2V0RGV2aWNlc0ZvclVzZXIgTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHJldHJpZXZlIGFsbCBwaHlzaWNhbCBkZXZpY2VzIGFzc29jaWF0ZWQgd2l0aCBhblxuICAgICAgICAgICAgICogaW5jb21pbmcgdXNlci5cbiAgICAgICAgICAgICAqIDQpIEZpbHRlciBvYnRhaW5lZCBkZXZpY2VzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cyAob25seSBjb25zaWRlciB0aGUgb25lcyB0aGF0IGFyZSBBQ1RJVkUgZm9yIHRoZSB1c2VyKS5cbiAgICAgICAgICAgICAqIDUpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgdG8gc3RvcmUgdGhlIG5vdGlmaWNhdGlvbiB0cmFuc2FjdGlvbiBpbiBEeW5hbW8gREJcbiAgICAgICAgICAgICAqIGFuZCBzZW5kIHRoZSBub3RpZmljYXRpb24gdGhyb3VnaCBDb3VyaWVyIGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QsIGNvbnZlcnQgdGhlIGluY29taW5nIGV2ZW50IG1lc3NhZ2UgYm9keSwgaW50byBhIHRyYW5zYWN0aW9uIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0gSlNPTi5wYXJzZSh0cmFuc2FjdGlvbmFsUmVjb3JkLmJvZHkpIGFzIFRyYW5zYWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIDEpIENhbGwgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIChleHRNZW1iZXJJRCkgZm9yIG1lbWJlclxuICAgICAgICAgICAgY29uc3QgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlOiBNZW1iZXJEZXRhaWxzUmVzcG9uc2UgPSBhd2FpdCBnZXRNZW1iZXJEZXRhaWxzKG9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbi5tZW1iZXJJZCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgIGlmIChtZW1iZXJEZXRhaWxzUmVzcG9uc2UgJiYgIW1lbWJlckRldGFpbHNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIW1lbWJlckRldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHRyYW5zYWN0aW9uIGlkLCB0byBiZSB0aGUgdXNlcklEIG1hcHBlZCB0byB0aGUgZXh0TWVtYmVySWQgcmV0cmlldmVkIGZyb20gdGhlIG1lbWJlciBkZXRhaWxzIGNhbGxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5pZCA9IG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhO1xuXG4gICAgICAgICAgICAgICAgLy8gMikgQ2FsbCB0aGUgR0VUIGJyYW5kIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBuYW1lIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IGJyYW5kRGV0YWlsc1Jlc3BvbnNlOiBUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgZ2V0QnJhbmREZXRhaWxzKG9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGJyYW5kIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAoYnJhbmREZXRhaWxzUmVzcG9uc2UgJiYgIWJyYW5kRGV0YWlsc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYnJhbmREZXRhaWxzUmVzcG9uc2UuZXJyb3JUeXBlICYmIGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gMykgQ2FsbCB0aGUgZ2V0RGV2aWNlc0ZvclVzZXIgTW9vbmJlYW0gQXBwc3luYyBBUEkgZW5kcG9pbnQgKG5lZWQgdG8gYWRkIHRoaXMgaW4gdGhlIGludGVybmFsIE1vb25iZWFtIENsaWVudCBmaXJzdCkuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZXNGb3JVc2VyUmVzcG9uc2U6IFVzZXJEZXZpY2VzUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5nZXREZXZpY2VzRm9yVXNlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdHJhbnNhY3Rpb24uaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgZGV2aWNlcyBmb3IgdXNlciBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlc0ZvclVzZXJSZXNwb25zZSAmJiAhZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA0KSBGaWx0ZXIgb2J0YWluZWQgZGV2aWNlcyBiYXNlZCBvbiB0aGVpciBzdGF0dXMgKG9ubHkgY29uc2lkZXIgdGhlIG9uZXMgdGhhdCBhcmUgQUNUSVZFIGZvciB0aGUgdXNlcikuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VUb2tlbklkczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdXNlckRldmljZSBvZiBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV2aWNlIS5kZXZpY2VTdGF0ZSA9PT0gVXNlckRldmljZVN0YXRlLkFjdGl2ZSAmJiBkZXZpY2VUb2tlbklkcy5wdXNoKHVzZXJEZXZpY2UhLnRva2VuSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgdXNlciBhc3NvY2lhdGVkIHBoeXNpY2FsIGRldmljZXMgdGhhdCBhcmUgYWN0aXZlLCB0byBzZW5kIG5vdGlmaWNhdGlvbnMgdG8sIHRoZW4gcHJvY2VlZCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRldmljZVRva2VuSWRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDUpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZU5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0cmFuc2FjdGlvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZS5OZXdRdWFsaWZ5aW5nT2ZmZXJBdmFpbGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5QdXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2VuczogZGV2aWNlVG9rZW5JZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZTogdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25CcmFuZE5hbWUsIC8vIG5lZWQgdG8gcmV0cmlldmUgdGhpcyB0aHJvdWdoIGEgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2s6IHRyYW5zYWN0aW9uLnJld2FyZEFtb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBOb3RpZmljYXRpb25TdGF0dXMuU2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSAmJiAhY3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgJiYgY3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm90aWZpY2F0aW9uIGV2ZW50IHN1Y2Nlc3NmdWxseSBwcm9jZXNzZWQsIHdpdGggbm90aWZpY2F0aW9uIGlkICR7Y3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YS5ub3RpZmljYXRpb25JZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXNlcklEIG1hcHBpbmcgdGhyb3VnaCBHRVQgbWVtYmVyIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQaHlzaWNhbCBEZXZpY2VzIG1hcHBpbmcgdGhyb3VnaCBHRVQgZGV2aWNlcyBmb3IgdXNlciBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEJyYW5kIERldGFpbHMgbWFwcGluZyB0aHJvdWdoIEdFVCBicmFuZCBkZXRhaWxzIGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiB0cmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVc2VySUQgbWFwcGluZyB0aHJvdWdoIEdFVCBtZW1iZXIgZGV0YWlscyBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkgaGVyZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBpdGVtRmFpbHVyZXNcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgJHtKU09OLnN0cmluZ2lmeShldmVudCl9IG5vdGlmaWNhdGlvbiB0cmFuc2FjdGlvbmFsIGV2ZW50ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBiYXRjaCByZXNwb25zZSBmYWlsdXJlIGZvciB0aGUgcGFydGljdWxhciBtZXNzYWdlIElEcyB3aGljaCBmYWlsZWRcbiAgICAgICAgICogaW4gdGhpcyBjYXNlLCB0aGUgTGFtYmRhIGZ1bmN0aW9uIERPRVMgTk9UIGRlbGV0ZSB0aGUgaW5jb21pbmcgbWVzc2FnZXMgZnJvbSB0aGUgcXVldWUsIGFuZCBpdCBtYWtlcyBpdCBhdmFpbGFibGUvdmlzaWJsZSBhZ2FpblxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IFt7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FzZSwgd2Ugb25seSBwcm9jZXNzIDEgcmVjb3JkIGF0IGEgdGltZSwgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdGhpcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIG9mIGEgdXNlciwgd2hpY2ggaW5jbHVkZXMgdGhlIGV4dE1lbWJlcklkXG4gKiBvZiBhIG1lbWJlciwgZGlyZWN0bHkgbWFwcGVkIHRvIGEgTW9vbmJlYW0gdXNlcklkLCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyBhIHRyYW5zYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIG1lbWJlcklkIHRoZSBpZCBvZiB0aGUgbWVtYmVyLCBvYnRhaW5lZCBmcm9tIE9saXZlIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UsXG4gKiB3aGljaCBkZXRhaWxzIGFyZSByZXRyaWV2ZWQgZm9yXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1lbWJlckRldGFpbHNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBkZXRhaWxzIG9mIGEgbWVtYmVyXG4gKiBpbiB0aGUgZm9ybSBvZiBlaXRoZXIgYW4gZXJyb3IsIG9yIGEgdmFsaWQgc3RyaW5nLWJhc2VkIHJlc3BvbnNlIHNpZ25pZnlpbmcgdGhlIG1lbWJlcidzIGV4dGVybmFsIGlkXG4gKi9cbmNvbnN0IGdldE1lbWJlckRldGFpbHMgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCBtZW1iZXJJZDogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXJEZXRhaWxzUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBleGVjdXRlIHRoZSBtZW1iZXIgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBNb29uYmVhbSB1c2VySWQgdG8gYmUgdXNlZCBpbiBhc3NvY2lhdGluZyBhIHRyYW5zYWN0aW9uIHdpdGggYSBNb29uYmVhbSB1c2VyXG4gICAgY29uc3QgcmVzcG9uc2U6IE1lbWJlckRldGFpbHNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE1lbWJlckRldGFpbHMobWVtYmVySWQpO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBtZW1iZXIncyBleHRlcm5hbCBJRCwgdG8gYmUgbWFwcGVkIHRvIE1vb25iZWFtJ3MgdXNlcklkXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIGJyYW5kIGRldGFpbHMsIHdoaWNoIG1haW5seSBpbmNsdWRlIHRoZSBuYW1lLCBsb2dvIGFuZCBkZXNjcmlwdGlvblxuICogb2YgdGhlIGJyYW5kIHRoYXQgdGhlIHRyYW5zYWN0aW9uIHdhcyBleGVjdXRlZCBhdCwgdG8gYmUgdXNlZCB3aGVuIHN0b3JpbmcgdGhlIHRyYW5zYWN0aW9uIGluIHRoZSBEQi5cbiAqXG4gKiBAcGFyYW0gb2xpdmVDbGllbnQgY2xpZW50IHVzZWQgdG8gbWFrZSBPbGl2ZSBBUEkgY2FsbHNcbiAqIEBwYXJhbSB0cmFuc2FjdGlvbiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0IG9idGFpbmVkIGZyb20gT2xpdmUgdGhyb3VnaCB0aGUgdHJhbnNhY3Rpb24gbWVzc2FnZSxcbiAqIHdoaWNoIGJyYW5kIGRldGFpbHMgb2J0YWluZWQgdGhyb3VnaCB0aGlzIGNhbGwgYXJlIGFwcGVuZGVkIHRvXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFRyYW5zYWN0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb24gaW5mb3JtYXRpb24gcGFzc2VkXG4gKiBpbiB0aHJvdWdoIHRoZSBTUVMgbWVzc2FnZSwgYWxvbmdzaWRlIHRoZSBicmFuZCBkZXRhaWxzIHJldHJpZXZlZCB0aHJvdWdoIHRoaXMgY2FsbC5cbiAqL1xuY29uc3QgZ2V0QnJhbmREZXRhaWxzID0gYXN5bmMgKG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uKTogUHJvbWlzZTxUcmFuc2FjdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgYnJhbmQgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBicmFuZCBkZXRhaWxzIGZvciB0aGUgaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICBjb25zdCByZXNwb25zZTogVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldEJyYW5kRGV0YWlscyh0cmFuc2FjdGlvbik7XG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGJyYW5kIGRldGFpbHMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZE5hbWUgJiYgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTmFtZS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTG9nb1VybCAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzICYmIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHJldHVybnMgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZGF0YVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGJyYW5kIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuIl19