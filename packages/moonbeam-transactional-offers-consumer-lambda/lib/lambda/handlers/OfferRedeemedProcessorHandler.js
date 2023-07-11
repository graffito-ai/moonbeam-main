"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOfferRedeemedTransactions = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * OfferRedeemedProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processOfferRedeemedTransactions = async (event) => {
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
        // for each record in the incoming event, repeat the transaction processing steps
        for (const transactionalRecord of event.Records) {
            /**
             * The overall transaction processing, will be made up of the following steps:
             *
             * 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
             * 2) Call the GET brand details Olive API to retrieve the brand name for incoming transaction
             * 3) Call the GET store details Olive API to retrieve the brand store address for incoming transaction
             * 4) Call the GET transaction details Olive API to retrieve the actual purchase date/time for an incoming transaction
             * 5) Convert any necessary timestamps and created/updated at times to appropriate formats
             * 6) Call the createTransaction Moonbeam AppSync API endpoint, to store transaction in Dynamo DB
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
                    // 3) Call the GET store details Olive API to retrieve the brand store address for incoming transaction
                    const storeDetailsResponse = await getStoreDetails(oliveClient, transaction);
                    // check to see if the store details call was successful or not
                    if (storeDetailsResponse && !storeDetailsResponse.errorMessage && !storeDetailsResponse.errorType && storeDetailsResponse.data) {
                        // 4) Call the GET transaction details Olive API to retrieve the actual purchase date/time for an incoming transaction
                        const transactionDetailsResponse = await getTransactionDetails(oliveClient, transaction);
                        // check to see if the transaction details call was successful or not
                        if (transactionDetailsResponse && !transactionDetailsResponse.errorMessage && !transactionDetailsResponse.errorType && transactionDetailsResponse.data) {
                            // 5) Convert any necessary timestamps and created/updated at times to appropriate formats
                            const createdAtFormatted = new Date(transaction.createdAt).toISOString();
                            transaction.createdAt = createdAtFormatted;
                            transaction.updatedAt = createdAtFormatted;
                            /**
                             * 6) Call the createTransaction Moonbeam AppSync API endpoint, to store transaction in Dynamo DB
                             *
                             * first initialize the Olive Client API here, in order to call the appropriate endpoints for this resolver
                             */
                            const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
                            // execute the createTransaction call
                            const response = await moonbeamClient.createTransaction(transaction);
                            // check to see if the card linking call was executed successfully
                            if (!response || response.errorMessage || response.errorType || !response.data || !response.id) {
                                console.log(`Unexpected error and/or response structure returned from the createTransaction call ${JSON.stringify(response)}!`);
                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: transactionalRecord.messageId
                                });
                            }
                        }
                        else {
                            console.log(`Transaction Details mapping through GET transaction details call failed`);
                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: transactionalRecord.messageId
                            });
                        }
                    }
                    else {
                        console.log(`Store Details mapping through GET store details call failed`);
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
        console.log(`Unexpected error while processing ${JSON.stringify(event)} transactional event ${error}`);
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
exports.processOfferRedeemedTransactions = processOfferRedeemedTransactions;
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
/**
 * Function used to retrieve the store details, which mainly include the address of the store, associated
 * with the brand that the transaction was executed at, to be used when storing the transaction in the DB.
 *
 * @param oliveClient client used to make Olive API calls
 * @param transaction the transaction object obtained from Olive through the transaction message,
 * which store details obtained through this call are appended to
 *
 * @returns a {@link Promise} of {@link TransactionResponse} representing the transaction information passed
 * in through the SQS message, alongside the store details retrieved through this call.
 */
const getStoreDetails = async (oliveClient, transaction) => {
    // execute the brand details retrieval call, in order to get the store details for the incoming transaction
    const response = await oliveClient.getStoreDetails(transaction);
    // check to see if the store details call was executed successfully
    if (response && !response.errorMessage && !response.errorType && response.data &&
        response.data.transactionBrandAddress && response.data.transactionBrandAddress.length !== 0 &&
        response.data.transactionIsOnline !== null) {
        // returns the updated transaction data
        return {
            data: response.data
        };
    }
    else {
        const errorMessage = `Unexpected response structure returned from the store details call!`;
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
 * Function used to retrieve the transaction details, which mainly include the time of purchase, associated
 * with the transaction event, to be used when storing the transaction in the DB.
 *
 * @param oliveClient client used to make Olive API calls
 * @param transaction the transaction object obtained from Olive through the transaction message,
 * which additional transaction details obtained through this call are appended to
 *
 * @returns a {@link Promise} of {@link TransactionResponse} representing the transaction information passed
 * in through the SQS message, alongside the additional transaction details retrieved through this call.
 */
const getTransactionDetails = async (oliveClient, transaction) => {
    // execute the transaction details retrieval call, in order to get additional transaction details for the incoming transaction
    const response = await oliveClient.getTransactionDetails(transaction);
    // check to see if the transaction details call was executed successfully
    if (response && !response.errorMessage && !response.errorType && response.data &&
        response.data.timestamp && response.data.timestamp !== 0) {
        // returns the updated transaction data
        return {
            data: response.data
        };
    }
    else {
        const errorMessage = `Unexpected response structure returned from the transaction details call!`;
        console.log(errorMessage);
        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2ZmZXJSZWRlZW1lZFByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL09mZmVyUmVkZWVtZWRQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQVNtQztBQUduQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLGdDQUFnQyxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDakcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsaUZBQWlGO1FBQ2pGLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdDOzs7Ozs7Ozs7ZUFTRztZQUNDLDRFQUE0RTtZQUNoRixNQUFNLFdBQVcsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQWdCLENBQUM7WUFFckYsb0dBQW9HO1lBQ3BHLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVuRSxtR0FBbUc7WUFDbkcsTUFBTSxxQkFBcUIsR0FBMEIsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRS9HLGdFQUFnRTtZQUNoRSxJQUFJLHFCQUFxQixJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxJQUFJLHFCQUFxQixDQUFDLElBQUksRUFBRTtnQkFDaEksNEdBQTRHO2dCQUM1RyxXQUFXLENBQUMsRUFBRSxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQztnQkFFNUMs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QyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFO1FBQzFELHVDQUF1QztRQUN2QyxPQUFPO1lBQ0gsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1NBQ3RCLENBQUE7S0FDSjtTQUFNO1FBQ0gsTUFBTSxZQUFZLEdBQUcsMkVBQTJFLENBQUM7UUFDakcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxQixzSEFBc0g7UUFDdEgsT0FBTztZQUNILElBQUksRUFBRSxJQUFJO1lBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7WUFDaEQsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTUVNCYXRjaFJlc3BvbnNlLCBTUVNFdmVudH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7XG4gICAgTWVtYmVyRGV0YWlsc1Jlc3BvbnNlLFxuICAgIE1vb25iZWFtQ2xpZW50LFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb24sXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvblJlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LFxuICAgIFRyYW5zYWN0aW9uLFxuICAgIFRyYW5zYWN0aW9uUmVzcG9uc2UsXG4gICAgVHJhbnNhY3Rpb25zRXJyb3JUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1NRU0JhdGNoSXRlbUZhaWx1cmV9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvc3FzXCI7XG5cbi8qKlxuICogT2ZmZXJSZWRlZW1lZFByb2Nlc3NvckhhbmRsZXIgaGFuZGxlclxuICpcbiAqIEBwYXJhbSBldmVudCB0aGUge0BsaW5rIFNRU0V2ZW50fSB0byBiZSBwcm9jZXNzZWQsIGNvbnRhaW5pbmcgdGhlIHRyYW5zYWN0aW9uXG4gKiBtZXNzYWdlIGluZm9ybWF0aW9uXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFNRU0JhdGNoUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBwcm9jZXNzT2ZmZXJSZWRlZW1lZFRyYW5zYWN0aW9ucyA9IGFzeW5jIChldmVudDogU1FTRXZlbnQpOiBQcm9taXNlPFNRU0JhdGNoUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvKipcbiAgICAgICAgICogaW5pdGlhbGl6aW5nIHRoZSBiYXRjaCByZXNwb25zZSwgYXMgYW4gZW1wdHkgYXJyYXksIHRoYXQgd2lsbCBiZSBwb3B1bGF0ZWQgd2l0aCBlcnJvcnMsIGlmIGFueSB0aHJvdWdob3V0IHRoZSBwcm9jZXNzaW5nXG4gICAgICAgICAqXG4gICAgICAgICAqIGZvciB0aGUgTGFtYmRhIHRvIGluZGljYXRlIFNRUyB0aGF0IHRoZXJlIGhhdmUgYmVlbiBubyBmYWlsdXJlcywgYW5kIHRodXMgZW5hYmxlIHRoZSBkZWxldGlvbiBvZiBhbGwgcHJvY2Vzc2VkIG1lc3NhZ2VzXG4gICAgICAgICAqIGZyb20gdGhlIHF1ZXVlLCB3ZSBoYXZlIHRvIHJldHVybiBhbiBlbXB0eSBiYXRjaEl0ZW1GYWlsdXJlcyBhcnJheS4gSWYgd2Ugd2FudCB0byBpbmRpY2F0ZSB0aGF0IHRoZXJlIGhhdmUgYmVlbiBlcnJvcnMsXG4gICAgICAgICAqIGZvciBlYWNoIGluZGl2aWR1YWwgbWVzc2FnZSwgYmFzZWQgb24gaXRzIElELCB3ZSBoYXZlIHRvIGFkZCBpdCBpbiB0aGUgZmluYWwgYmF0Y2ggcmVzcG9uc2VcbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaXRlbUZhaWx1cmVzOiBTUVNCYXRjaEl0ZW1GYWlsdXJlW10gPSBbXTtcblxuICAgICAgICAvLyBmb3IgZWFjaCByZWNvcmQgaW4gdGhlIGluY29taW5nIGV2ZW50LCByZXBlYXQgdGhlIHRyYW5zYWN0aW9uIHByb2Nlc3Npbmcgc3RlcHNcbiAgICAgICAgZm9yIChjb25zdCB0cmFuc2FjdGlvbmFsUmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG92ZXJhbGwgdHJhbnNhY3Rpb24gcHJvY2Vzc2luZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogMSkgQ2FsbCB0aGUgR0VUIG1lbWJlciBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgbWVtYmVyIGRldGFpbHMgKGV4dE1lbWJlcklEKSBmb3IgbWVtYmVyXG4gICAgICAgICAgICAgKiAyKSBDYWxsIHRoZSBHRVQgYnJhbmQgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGJyYW5kIG5hbWUgZm9yIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgKiAzKSBDYWxsIHRoZSBHRVQgc3RvcmUgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGJyYW5kIHN0b3JlIGFkZHJlc3MgZm9yIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgKiA0KSBDYWxsIHRoZSBHRVQgdHJhbnNhY3Rpb24gZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGFjdHVhbCBwdXJjaGFzZSBkYXRlL3RpbWUgZm9yIGFuIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgKiA1KSBDb252ZXJ0IGFueSBuZWNlc3NhcnkgdGltZXN0YW1wcyBhbmQgY3JlYXRlZC91cGRhdGVkIGF0IHRpbWVzIHRvIGFwcHJvcHJpYXRlIGZvcm1hdHNcbiAgICAgICAgICAgICAqIDYpIENhbGwgdGhlIGNyZWF0ZVRyYW5zYWN0aW9uIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50LCB0byBzdG9yZSB0cmFuc2FjdGlvbiBpbiBEeW5hbW8gREJcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIC8vIGZpcnN0LCBjb252ZXJ0IHRoZSBpbmNvbWluZyBldmVudCBtZXNzYWdlIGJvZHksIGludG8gYSB0cmFuc2FjdGlvbiBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbiA9IEpTT04ucGFyc2UodHJhbnNhY3Rpb25hbFJlY29yZC5ib2R5KSBhcyBUcmFuc2FjdGlvbjtcblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAvLyAxKSBDYWxsIHRoZSBHRVQgbWVtYmVyIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBtZW1iZXIgZGV0YWlscyAoZXh0TWVtYmVySUQpIGZvciBtZW1iZXJcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlckRldGFpbHNSZXNwb25zZTogTWVtYmVyRGV0YWlsc1Jlc3BvbnNlID0gYXdhaXQgZ2V0TWVtYmVyRGV0YWlscyhvbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb24ubWVtYmVySWQpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG1lbWJlciBkZXRhaWxzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICBpZiAobWVtYmVyRGV0YWlsc1Jlc3BvbnNlICYmICFtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZXJyb3JUeXBlICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSB0cmFuc2FjdGlvbiBpZCwgdG8gYmUgdGhlIHVzZXJJRCBtYXBwZWQgdG8gdGhlIGV4dE1lbWJlcklkIHJldHJpZXZlZCBmcm9tIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24uaWQgPSBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YTtcblxuICAgICAgICAgICAgICAgIC8vIDIpIENhbGwgdGhlIEdFVCBicmFuZCBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgYnJhbmQgbmFtZSBmb3IgaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAgICBjb25zdCBicmFuZERldGFpbHNSZXNwb25zZTogVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IGdldEJyYW5kRGV0YWlscyhvbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb24pO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBicmFuZCBkZXRhaWxzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgaWYgKGJyYW5kRGV0YWlsc1Jlc3BvbnNlICYmICFicmFuZERldGFpbHNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWJyYW5kRGV0YWlsc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBicmFuZERldGFpbHNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIDMpIENhbGwgdGhlIEdFVCBzdG9yZSBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgYnJhbmQgc3RvcmUgYWRkcmVzcyBmb3IgaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RvcmVEZXRhaWxzUmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBnZXRTdG9yZURldGFpbHMob2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHN0b3JlIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3JlRGV0YWlsc1Jlc3BvbnNlICYmICFzdG9yZURldGFpbHNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXN0b3JlRGV0YWlsc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBzdG9yZURldGFpbHNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA0KSBDYWxsIHRoZSBHRVQgdHJhbnNhY3Rpb24gZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGFjdHVhbCBwdXJjaGFzZSBkYXRlL3RpbWUgZm9yIGFuIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZTogVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IGdldFRyYW5zYWN0aW9uRGV0YWlscyhvbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZSAmJiAhdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICF0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDUpIENvbnZlcnQgYW55IG5lY2Vzc2FyeSB0aW1lc3RhbXBzIGFuZCBjcmVhdGVkL3VwZGF0ZWQgYXQgdGltZXMgdG8gYXBwcm9wcmlhdGUgZm9ybWF0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWRBdEZvcm1hdHRlZCA9IG5ldyBEYXRlKHRyYW5zYWN0aW9uLmNyZWF0ZWRBdCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5jcmVhdGVkQXQgPSBjcmVhdGVkQXRGb3JtYXR0ZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24udXBkYXRlZEF0ID0gY3JlYXRlZEF0Rm9ybWF0dGVkO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogNikgQ2FsbCB0aGUgY3JlYXRlVHJhbnNhY3Rpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHN0b3JlIHRyYW5zYWN0aW9uIGluIER5bmFtbyBEQlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogZmlyc3QgaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgcmVzb2x2ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBjcmVhdGVUcmFuc2FjdGlvbiBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2U6IE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZVRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uIGFzIE1vb25iZWFtVHJhbnNhY3Rpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBjYXJkIGxpbmtpbmcgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZSB8fCByZXNwb25zZS5lcnJvck1lc3NhZ2UgfHwgcmVzcG9uc2UuZXJyb3JUeXBlIHx8ICFyZXNwb25zZS5kYXRhIHx8ICFyZXNwb25zZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciBhbmQvb3IgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGNyZWF0ZVRyYW5zYWN0aW9uIGNhbGwgJHtKU09OLnN0cmluZ2lmeShyZXNwb25zZSl9IWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVHJhbnNhY3Rpb24gRGV0YWlscyBtYXBwaW5nIHRocm91Z2ggR0VUIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3RvcmUgRGV0YWlscyBtYXBwaW5nIHRocm91Z2ggR0VUIHN0b3JlIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCcmFuZCBEZXRhaWxzIG1hcHBpbmcgdGhyb3VnaCBHRVQgYnJhbmQgZGV0YWlscyBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXNlcklEIG1hcHBpbmcgdGhyb3VnaCBHRVQgbWVtYmVyIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5IGhlcmUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiYXRjaEl0ZW1GYWlsdXJlczogaXRlbUZhaWx1cmVzXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQpfSB0cmFuc2FjdGlvbmFsIGV2ZW50ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBiYXRjaCByZXNwb25zZSBmYWlsdXJlIGZvciB0aGUgcGFydGljdWxhciBtZXNzYWdlIElEcyB3aGljaCBmYWlsZWRcbiAgICAgICAgICogaW4gdGhpcyBjYXNlLCB0aGUgTGFtYmRhIGZ1bmN0aW9uIERPRVMgTk9UIGRlbGV0ZSB0aGUgaW5jb21pbmcgbWVzc2FnZXMgZnJvbSB0aGUgcXVldWUsIGFuZCBpdCBtYWtlcyBpdCBhdmFpbGFibGUvdmlzaWJsZSBhZ2FpblxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IFt7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FzZSwgd2Ugb25seSBwcm9jZXNzIDEgcmVjb3JkIGF0IGEgdGltZSwgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdGhpcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIG9mIGEgdXNlciwgd2hpY2ggaW5jbHVkZXMgdGhlIGV4dE1lbWJlcklkXG4gKiBvZiBhIG1lbWJlciwgZGlyZWN0bHkgbWFwcGVkIHRvIGEgTW9vbmJlYW0gdXNlcklkLCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyBhIHRyYW5zYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIG1lbWJlcklkIHRoZSBpZCBvZiB0aGUgbWVtYmVyLCBvYnRhaW5lZCBmcm9tIE9saXZlIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UsXG4gKiB3aGljaCBkZXRhaWxzIGFyZSByZXRyaWV2ZWQgZm9yXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1lbWJlckRldGFpbHNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBkZXRhaWxzIG9mIGEgbWVtYmVyXG4gKiBpbiB0aGUgZm9ybSBvZiBlaXRoZXIgYW4gZXJyb3IsIG9yIGEgdmFsaWQgc3RyaW5nLWJhc2VkIHJlc3BvbnNlIHNpZ25pZnlpbmcgdGhlIG1lbWJlcidzIGV4dGVybmFsIGlkXG4gKi9cbmNvbnN0IGdldE1lbWJlckRldGFpbHMgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCBtZW1iZXJJZDogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXJEZXRhaWxzUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBleGVjdXRlIHRoZSBtZW1iZXIgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBNb29uYmVhbSB1c2VySWQgdG8gYmUgdXNlZCBpbiBhc3NvY2lhdGluZyBhIHRyYW5zYWN0aW9uIHdpdGggYSBNb29uYmVhbSB1c2VyXG4gICAgY29uc3QgcmVzcG9uc2U6IE1lbWJlckRldGFpbHNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE1lbWJlckRldGFpbHMobWVtYmVySWQpO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBtZW1iZXIncyBleHRlcm5hbCBJRCwgdG8gYmUgbWFwcGVkIHRvIE1vb25iZWFtJ3MgdXNlcklkXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIGJyYW5kIGRldGFpbHMsIHdoaWNoIG1haW5seSBpbmNsdWRlIHRoZSBuYW1lLCBsb2dvIGFuZCBkZXNjcmlwdGlvblxuICogb2YgdGhlIGJyYW5kIHRoYXQgdGhlIHRyYW5zYWN0aW9uIHdhcyBleGVjdXRlZCBhdCwgdG8gYmUgdXNlZCB3aGVuIHN0b3JpbmcgdGhlIHRyYW5zYWN0aW9uIGluIHRoZSBEQi5cbiAqXG4gKiBAcGFyYW0gb2xpdmVDbGllbnQgY2xpZW50IHVzZWQgdG8gbWFrZSBPbGl2ZSBBUEkgY2FsbHNcbiAqIEBwYXJhbSB0cmFuc2FjdGlvbiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0IG9idGFpbmVkIGZyb20gT2xpdmUgdGhyb3VnaCB0aGUgdHJhbnNhY3Rpb24gbWVzc2FnZSxcbiAqIHdoaWNoIGJyYW5kIGRldGFpbHMgb2J0YWluZWQgdGhyb3VnaCB0aGlzIGNhbGwgYXJlIGFwcGVuZGVkIHRvXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFRyYW5zYWN0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb24gaW5mb3JtYXRpb24gcGFzc2VkXG4gKiBpbiB0aHJvdWdoIHRoZSBTUVMgbWVzc2FnZSwgYWxvbmdzaWRlIHRoZSBicmFuZCBkZXRhaWxzIHJldHJpZXZlZCB0aHJvdWdoIHRoaXMgY2FsbC5cbiAqL1xuY29uc3QgZ2V0QnJhbmREZXRhaWxzID0gYXN5bmMgKG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uKTogUHJvbWlzZTxUcmFuc2FjdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgYnJhbmQgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBicmFuZCBkZXRhaWxzIGZvciB0aGUgaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICBjb25zdCByZXNwb25zZTogVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldEJyYW5kRGV0YWlscyh0cmFuc2FjdGlvbik7XG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGJyYW5kIGRldGFpbHMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZE5hbWUgJiYgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTmFtZS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTG9nb1VybCAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzICYmIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHJldHVybnMgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZGF0YVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGJyYW5kIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIHN0b3JlIGRldGFpbHMsIHdoaWNoIG1haW5seSBpbmNsdWRlIHRoZSBhZGRyZXNzIG9mIHRoZSBzdG9yZSwgYXNzb2NpYXRlZFxuICogd2l0aCB0aGUgYnJhbmQgdGhhdCB0aGUgdHJhbnNhY3Rpb24gd2FzIGV4ZWN1dGVkIGF0LCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyB0aGUgdHJhbnNhY3Rpb24gaW4gdGhlIERCLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIHRyYW5zYWN0aW9uIHRoZSB0cmFuc2FjdGlvbiBvYmplY3Qgb2J0YWluZWQgZnJvbSBPbGl2ZSB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlLFxuICogd2hpY2ggc3RvcmUgZGV0YWlscyBvYnRhaW5lZCB0aHJvdWdoIHRoaXMgY2FsbCBhcmUgYXBwZW5kZWQgdG9cbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbiBpbmZvcm1hdGlvbiBwYXNzZWRcbiAqIGluIHRocm91Z2ggdGhlIFNRUyBtZXNzYWdlLCBhbG9uZ3NpZGUgdGhlIHN0b3JlIGRldGFpbHMgcmV0cmlldmVkIHRocm91Z2ggdGhpcyBjYWxsLlxuICovXG5jb25zdCBnZXRTdG9yZURldGFpbHMgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb24pOiBQcm9taXNlPFRyYW5zYWN0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBleGVjdXRlIHRoZSBicmFuZCBkZXRhaWxzIHJldHJpZXZhbCBjYWxsLCBpbiBvcmRlciB0byBnZXQgdGhlIHN0b3JlIGRldGFpbHMgZm9yIHRoZSBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgIGNvbnN0IHJlc3BvbnNlOiBUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0U3RvcmVEZXRhaWxzKHRyYW5zYWN0aW9uKTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgc3RvcmUgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kQWRkcmVzcyAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uSXNPbmxpbmUgIT09IG51bGwpIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBkYXRhXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgc3RvcmUgZGV0YWlscyBjYWxsIWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscywgd2hpY2ggbWFpbmx5IGluY2x1ZGUgdGhlIHRpbWUgb2YgcHVyY2hhc2UsIGFzc29jaWF0ZWRcbiAqIHdpdGggdGhlIHRyYW5zYWN0aW9uIGV2ZW50LCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyB0aGUgdHJhbnNhY3Rpb24gaW4gdGhlIERCLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIHRyYW5zYWN0aW9uIHRoZSB0cmFuc2FjdGlvbiBvYmplY3Qgb2J0YWluZWQgZnJvbSBPbGl2ZSB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlLFxuICogd2hpY2ggYWRkaXRpb25hbCB0cmFuc2FjdGlvbiBkZXRhaWxzIG9idGFpbmVkIHRocm91Z2ggdGhpcyBjYWxsIGFyZSBhcHBlbmRlZCB0b1xuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uIGluZm9ybWF0aW9uIHBhc3NlZFxuICogaW4gdGhyb3VnaCB0aGUgU1FTIG1lc3NhZ2UsIGFsb25nc2lkZSB0aGUgYWRkaXRpb25hbCB0cmFuc2FjdGlvbiBkZXRhaWxzIHJldHJpZXZlZCB0aHJvdWdoIHRoaXMgY2FsbC5cbiAqL1xuY29uc3QgZ2V0VHJhbnNhY3Rpb25EZXRhaWxzID0gYXN5bmMgKG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uKTogUHJvbWlzZTxUcmFuc2FjdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IGFkZGl0aW9uYWwgdHJhbnNhY3Rpb24gZGV0YWlscyBmb3IgdGhlIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgY29uc3QgcmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRUcmFuc2FjdGlvbkRldGFpbHModHJhbnNhY3Rpb24pO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRpbWVzdGFtcCAmJiByZXNwb25zZS5kYXRhLnRpbWVzdGFtcCAhPT0gMCkge1xuICAgICAgICAvLyByZXR1cm5zIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGRhdGFcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwhYDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==