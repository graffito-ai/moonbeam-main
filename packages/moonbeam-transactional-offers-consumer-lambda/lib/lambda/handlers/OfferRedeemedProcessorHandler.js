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
             * 4) Convert any necessary timestamps and created/updated at times to appropriate formats
             * 5) Call the createTransaction Moonbeam AppSync API endpoint, to store transaction in Dynamo DB
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
                        // 4) Convert any necessary timestamps and created/updated at times to appropriate formats
                        const createdAtFormatted = new Date(transaction.createdAt).toISOString();
                        transaction.createdAt = createdAtFormatted;
                        transaction.updatedAt = createdAtFormatted;
                        transaction.timestamp = Date.parse(createdAtFormatted);
                        /**
                         * 5) Call the createTransaction Moonbeam AppSync API endpoint, to store transaction in Dynamo DB
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
        response.data.transactionBrandDescription && response.data.transactionBrandDescription.length !== 0) {
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
        response.data.transactionBrandDescription && response.data.transactionBrandDescription.length !== 0) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2ZmZXJSZWRlZW1lZFByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL09mZmVyUmVkZWVtZWRQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQVNtQztBQUduQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLGdDQUFnQyxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDakcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsaUZBQWlGO1FBQ2pGLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdDOzs7Ozs7OztlQVFHO1lBQ0MsNEVBQTRFO1lBQ2hGLE1BQU0sV0FBVyxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBZ0IsQ0FBQztZQUVyRixvR0FBb0c7WUFDcEcsTUFBTSxXQUFXLEdBQUcsSUFBSSw2QkFBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRW5FLG1HQUFtRztZQUNuRyxNQUFNLHFCQUFxQixHQUEwQixNQUFNLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFL0csZ0VBQWdFO1lBQ2hFLElBQUkscUJBQXFCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLElBQUkscUJBQXFCLENBQUMsSUFBSSxFQUFFO2dCQUNoSSw0R0FBNEc7Z0JBQzVHLFdBQVcsQ0FBQyxFQUFFLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDO2dCQUU1Qyw4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QU0sS0FBSyxDQUFDLEVBQUU7UUFDckcsdUNBQXVDO1FBQ3ZDLE9BQU87WUFDSCxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7U0FDdEIsQ0FBQTtLQUNKO1NBQU07UUFDSCxNQUFNLFlBQVksR0FBRyxxRUFBcUUsQ0FBQztRQUMzRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFCLHNIQUFzSDtRQUN0SCxPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUk7WUFDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtZQUNoRCxZQUFZLEVBQUUsWUFBWTtTQUM3QixDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NRU0JhdGNoUmVzcG9uc2UsIFNRU0V2ZW50fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtcbiAgICBNZW1iZXJEZXRhaWxzUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbixcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgVHJhbnNhY3Rpb24sXG4gICAgVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBUcmFuc2FjdGlvbnNFcnJvclR5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7U1FTQmF0Y2hJdGVtRmFpbHVyZX0gZnJvbSBcImF3cy1sYW1iZGEvdHJpZ2dlci9zcXNcIjtcblxuLyoqXG4gKiBPZmZlclJlZGVlbWVkUHJvY2Vzc29ySGFuZGxlciBoYW5kbGVyXG4gKlxuICogQHBhcmFtIGV2ZW50IHRoZSB7QGxpbmsgU1FTRXZlbnR9IHRvIGJlIHByb2Nlc3NlZCwgY29udGFpbmluZyB0aGUgdHJhbnNhY3Rpb25cbiAqIG1lc3NhZ2UgaW5mb3JtYXRpb25cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgU1FTQmF0Y2hSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHByb2Nlc3NPZmZlclJlZGVlbWVkVHJhbnNhY3Rpb25zID0gYXN5bmMgKGV2ZW50OiBTUVNFdmVudCk6IFByb21pc2U8U1FTQmF0Y2hSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpbml0aWFsaXppbmcgdGhlIGJhdGNoIHJlc3BvbnNlLCBhcyBhbiBlbXB0eSBhcnJheSwgdGhhdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGVycm9ycywgaWYgYW55IHRocm91Z2hvdXQgdGhlIHByb2Nlc3NpbmdcbiAgICAgICAgICpcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5LiBJZiB3ZSB3YW50IHRvIGluZGljYXRlIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIGVycm9ycyxcbiAgICAgICAgICogZm9yIGVhY2ggaW5kaXZpZHVhbCBtZXNzYWdlLCBiYXNlZCBvbiBpdHMgSUQsIHdlIGhhdmUgdG8gYWRkIGl0IGluIHRoZSBmaW5hbCBiYXRjaCByZXNwb25zZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpdGVtRmFpbHVyZXM6IFNRU0JhdGNoSXRlbUZhaWx1cmVbXSA9IFtdO1xuXG4gICAgICAgIC8vIGZvciBlYWNoIHJlY29yZCBpbiB0aGUgaW5jb21pbmcgZXZlbnQsIHJlcGVhdCB0aGUgdHJhbnNhY3Rpb24gcHJvY2Vzc2luZyBzdGVwc1xuICAgICAgICBmb3IgKGNvbnN0IHRyYW5zYWN0aW9uYWxSZWNvcmQgb2YgZXZlbnQuUmVjb3Jkcykge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3ZlcmFsbCB0cmFuc2FjdGlvbiBwcm9jZXNzaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiAxKSBDYWxsIHRoZSBHRVQgbWVtYmVyIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBtZW1iZXIgZGV0YWlscyAoZXh0TWVtYmVySUQpIGZvciBtZW1iZXJcbiAgICAgICAgICAgICAqIDIpIENhbGwgdGhlIEdFVCBicmFuZCBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgYnJhbmQgbmFtZSBmb3IgaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAqIDMpIENhbGwgdGhlIEdFVCBzdG9yZSBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgYnJhbmQgc3RvcmUgYWRkcmVzcyBmb3IgaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAqIDQpIENvbnZlcnQgYW55IG5lY2Vzc2FyeSB0aW1lc3RhbXBzIGFuZCBjcmVhdGVkL3VwZGF0ZWQgYXQgdGltZXMgdG8gYXBwcm9wcmlhdGUgZm9ybWF0c1xuICAgICAgICAgICAgICogNSkgQ2FsbCB0aGUgY3JlYXRlVHJhbnNhY3Rpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHN0b3JlIHRyYW5zYWN0aW9uIGluIER5bmFtbyBEQlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QsIGNvbnZlcnQgdGhlIGluY29taW5nIGV2ZW50IG1lc3NhZ2UgYm9keSwgaW50byBhIHRyYW5zYWN0aW9uIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0gSlNPTi5wYXJzZSh0cmFuc2FjdGlvbmFsUmVjb3JkLmJvZHkpIGFzIFRyYW5zYWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIDEpIENhbGwgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIChleHRNZW1iZXJJRCkgZm9yIG1lbWJlclxuICAgICAgICAgICAgY29uc3QgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlOiBNZW1iZXJEZXRhaWxzUmVzcG9uc2UgPSBhd2FpdCBnZXRNZW1iZXJEZXRhaWxzKG9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbi5tZW1iZXJJZCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgIGlmIChtZW1iZXJEZXRhaWxzUmVzcG9uc2UgJiYgIW1lbWJlckRldGFpbHNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIW1lbWJlckRldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHRyYW5zYWN0aW9uIGlkLCB0byBiZSB0aGUgdXNlcklEIG1hcHBlZCB0byB0aGUgZXh0TWVtYmVySWQgcmV0cmlldmVkIGZyb20gdGhlIG1lbWJlciBkZXRhaWxzIGNhbGxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5pZCA9IG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhO1xuXG4gICAgICAgICAgICAgICAgLy8gMikgQ2FsbCB0aGUgR0VUIGJyYW5kIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBuYW1lIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IGJyYW5kRGV0YWlsc1Jlc3BvbnNlOiBUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgZ2V0QnJhbmREZXRhaWxzKG9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGJyYW5kIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAoYnJhbmREZXRhaWxzUmVzcG9uc2UgJiYgIWJyYW5kRGV0YWlsc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYnJhbmREZXRhaWxzUmVzcG9uc2UuZXJyb3JUeXBlICYmIGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMykgQ2FsbCB0aGUgR0VUIHN0b3JlIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBzdG9yZSBhZGRyZXNzIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdG9yZURldGFpbHNSZXNwb25zZTogVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IGdldFN0b3JlRGV0YWlscyhvbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgc3RvcmUgZGV0YWlscyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcmVEZXRhaWxzUmVzcG9uc2UgJiYgIXN0b3JlRGV0YWlsc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhc3RvcmVEZXRhaWxzUmVzcG9uc2UuZXJyb3JUeXBlICYmIHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDQpIENvbnZlcnQgYW55IG5lY2Vzc2FyeSB0aW1lc3RhbXBzIGFuZCBjcmVhdGVkL3VwZGF0ZWQgYXQgdGltZXMgdG8gYXBwcm9wcmlhdGUgZm9ybWF0c1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlZEF0Rm9ybWF0dGVkID0gbmV3IERhdGUodHJhbnNhY3Rpb24uY3JlYXRlZEF0KS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24uY3JlYXRlZEF0ID0gY3JlYXRlZEF0Rm9ybWF0dGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24udXBkYXRlZEF0ID0gY3JlYXRlZEF0Rm9ybWF0dGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24udGltZXN0YW1wID0gRGF0ZS5wYXJzZShjcmVhdGVkQXRGb3JtYXR0ZWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIDUpIENhbGwgdGhlIGNyZWF0ZVRyYW5zYWN0aW9uIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50LCB0byBzdG9yZSB0cmFuc2FjdGlvbiBpbiBEeW5hbW8gREJcbiAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBmaXJzdCBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIGNyZWF0ZVRyYW5zYWN0aW9uIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVUcmFuc2FjdGlvbih0cmFuc2FjdGlvbiBhcyBNb29uYmVhbVRyYW5zYWN0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBjYXJkIGxpbmtpbmcgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8IHJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fCByZXNwb25zZS5lcnJvclR5cGUgfHwgIXJlc3BvbnNlLmRhdGEgfHwgIXJlc3BvbnNlLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3IgYW5kL29yIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBjcmVhdGVUcmFuc2FjdGlvbiBjYWxsICR7SlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpfSFgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3RvcmUgRGV0YWlscyBtYXBwaW5nIHRocm91Z2ggR0VUIHN0b3JlIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCcmFuZCBEZXRhaWxzIG1hcHBpbmcgdGhyb3VnaCBHRVQgYnJhbmQgZGV0YWlscyBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXNlcklEIG1hcHBpbmcgdGhyb3VnaCBHRVQgbWVtYmVyIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5IGhlcmUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiYXRjaEl0ZW1GYWlsdXJlczogaXRlbUZhaWx1cmVzXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQpfSB0cmFuc2FjdGlvbmFsIGV2ZW50ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBiYXRjaCByZXNwb25zZSBmYWlsdXJlIGZvciB0aGUgcGFydGljdWxhciBtZXNzYWdlIElEcyB3aGljaCBmYWlsZWRcbiAgICAgICAgICogaW4gdGhpcyBjYXNlLCB0aGUgTGFtYmRhIGZ1bmN0aW9uIERPRVMgTk9UIGRlbGV0ZSB0aGUgaW5jb21pbmcgbWVzc2FnZXMgZnJvbSB0aGUgcXVldWUsIGFuZCBpdCBtYWtlcyBpdCBhdmFpbGFibGUvdmlzaWJsZSBhZ2FpblxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IFt7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FzZSwgd2Ugb25seSBwcm9jZXNzIDEgcmVjb3JkIGF0IGEgdGltZSwgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdGhpcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIG9mIGEgdXNlciwgd2hpY2ggaW5jbHVkZXMgdGhlIGV4dE1lbWJlcklkXG4gKiBvZiBhIG1lbWJlciwgZGlyZWN0bHkgbWFwcGVkIHRvIGEgTW9vbmJlYW0gdXNlcklkLCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyBhIHRyYW5zYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIG1lbWJlcklkIHRoZSBpZCBvZiB0aGUgbWVtYmVyLCBvYnRhaW5lZCBmcm9tIE9saXZlIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UsXG4gKiB3aGljaCBkZXRhaWxzIGFyZSByZXRyaWV2ZWQgZm9yXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1lbWJlckRldGFpbHNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBkZXRhaWxzIG9mIGEgbWVtYmVyXG4gKiBpbiB0aGUgZm9ybSBvZiBlaXRoZXIgYW4gZXJyb3IsIG9yIGEgdmFsaWQgc3RyaW5nLWJhc2VkIHJlc3BvbnNlIHNpZ25pZnlpbmcgdGhlIG1lbWJlcidzIGV4dGVybmFsIGlkXG4gKi9cbmNvbnN0IGdldE1lbWJlckRldGFpbHMgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCBtZW1iZXJJZDogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXJEZXRhaWxzUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBleGVjdXRlIHRoZSBtZW1iZXIgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBNb29uYmVhbSB1c2VySWQgdG8gYmUgdXNlZCBpbiBhc3NvY2lhdGluZyBhIHRyYW5zYWN0aW9uIHdpdGggYSBNb29uYmVhbSB1c2VyXG4gICAgY29uc3QgcmVzcG9uc2U6IE1lbWJlckRldGFpbHNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE1lbWJlckRldGFpbHMobWVtYmVySWQpO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBtZW1iZXIncyBleHRlcm5hbCBJRCwgdG8gYmUgbWFwcGVkIHRvIE1vb25iZWFtJ3MgdXNlcklkXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIGJyYW5kIGRldGFpbHMsIHdoaWNoIG1haW5seSBpbmNsdWRlIHRoZSBuYW1lLCBsb2dvIGFuZCBkZXNjcmlwdGlvblxuICogb2YgdGhlIGJyYW5kIHRoYXQgdGhlIHRyYW5zYWN0aW9uIHdhcyBleGVjdXRlZCBhdCwgdG8gYmUgdXNlZCB3aGVuIHN0b3JpbmcgdGhlIHRyYW5zYWN0aW9uIGluIHRoZSBEQi5cbiAqXG4gKiBAcGFyYW0gb2xpdmVDbGllbnQgY2xpZW50IHVzZWQgdG8gbWFrZSBPbGl2ZSBBUEkgY2FsbHNcbiAqIEBwYXJhbSB0cmFuc2FjdGlvbiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0IG9idGFpbmVkIGZyb20gT2xpdmUgdGhyb3VnaCB0aGUgdHJhbnNhY3Rpb24gbWVzc2FnZSxcbiAqIHdoaWNoIGJyYW5kIGRldGFpbHMgb2J0YWluZWQgdGhyb3VnaCB0aGlzIGNhbGwgYXJlIGFwcGVuZGVkIHRvXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFRyYW5zYWN0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb24gaW5mb3JtYXRpb24gcGFzc2VkXG4gKiBpbiB0aHJvdWdoIHRoZSBTUVMgbWVzc2FnZSwgYWxvbmdzaWRlIHRoZSBicmFuZCBkZXRhaWxzIHJldHJpZXZlZCB0aHJvdWdoIHRoaXMgY2FsbC5cbiAqL1xuY29uc3QgZ2V0QnJhbmREZXRhaWxzID0gYXN5bmMgKG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uKTogUHJvbWlzZTxUcmFuc2FjdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgYnJhbmQgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBicmFuZCBkZXRhaWxzIGZvciB0aGUgaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICBjb25zdCByZXNwb25zZTogVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldEJyYW5kRGV0YWlscyh0cmFuc2FjdGlvbik7XG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGJyYW5kIGRldGFpbHMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZE5hbWUgJiYgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTmFtZS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTG9nb1VybCAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmREZXNjcmlwdGlvbiAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmREZXNjcmlwdGlvbi5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBkYXRhXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgYnJhbmQgZGV0YWlscyBjYWxsIWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgc3RvcmUgZGV0YWlscywgd2hpY2ggbWFpbmx5IGluY2x1ZGUgdGhlIGFkZHJlc3Mgb2YgdGhlIHN0b3JlLCBhc3NvY2lhdGVkXG4gKiB3aXRoIHRoZSBicmFuZCB0aGF0IHRoZSB0cmFuc2FjdGlvbiB3YXMgZXhlY3V0ZWQgYXQsIHRvIGJlIHVzZWQgd2hlbiBzdG9yaW5nIHRoZSB0cmFuc2FjdGlvbiBpbiB0aGUgREIuXG4gKlxuICogQHBhcmFtIG9saXZlQ2xpZW50IGNsaWVudCB1c2VkIHRvIG1ha2UgT2xpdmUgQVBJIGNhbGxzXG4gKiBAcGFyYW0gdHJhbnNhY3Rpb24gdGhlIHRyYW5zYWN0aW9uIG9iamVjdCBvYnRhaW5lZCBmcm9tIE9saXZlIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UsXG4gKiB3aGljaCBzdG9yZSBkZXRhaWxzIG9idGFpbmVkIHRocm91Z2ggdGhpcyBjYWxsIGFyZSBhcHBlbmRlZCB0b1xuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uIGluZm9ybWF0aW9uIHBhc3NlZFxuICogaW4gdGhyb3VnaCB0aGUgU1FTIG1lc3NhZ2UsIGFsb25nc2lkZSB0aGUgc3RvcmUgZGV0YWlscyByZXRyaWV2ZWQgdGhyb3VnaCB0aGlzIGNhbGwuXG4gKi9cbmNvbnN0IGdldFN0b3JlRGV0YWlscyA9IGFzeW5jIChvbGl2ZUNsaWVudDogT2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbik6IFByb21pc2U8VHJhbnNhY3Rpb25SZXNwb25zZT4gPT4ge1xuICAgIC8vIGV4ZWN1dGUgdGhlIGJyYW5kIGRldGFpbHMgcmV0cmlldmFsIGNhbGwsIGluIG9yZGVyIHRvIGdldCB0aGUgc3RvcmUgZGV0YWlscyBmb3IgdGhlIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgY29uc3QgcmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRTdG9yZURldGFpbHModHJhbnNhY3Rpb24pO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBzdG9yZSBkZXRhaWxzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmREZXNjcmlwdGlvbiAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmREZXNjcmlwdGlvbi5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBkYXRhXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgc3RvcmUgZGV0YWlscyBjYWxsIWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=