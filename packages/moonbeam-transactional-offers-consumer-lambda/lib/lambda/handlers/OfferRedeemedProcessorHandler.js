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
                        if (response && !response.errorMessage && !response.errorType && response.data) {
                            // convert the incoming linked data into a CardLink object
                            const transactionResponse = response.data;
                            console.log(JSON.stringify(transactionResponse));
                        }
                        else {
                            console.log(`Unexpected error returned from the createTransaction call!`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2ZmZXJSZWRlZW1lZFByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL09mZmVyUmVkZWVtZWRQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQVNtQztBQUduQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLGdDQUFnQyxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDakcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsaUZBQWlGO1FBQ2pGLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdDOzs7Ozs7OztlQVFHO1lBQ0MsNEVBQTRFO1lBQ2hGLE1BQU0sV0FBVyxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBZ0IsQ0FBQztZQUVyRixvR0FBb0c7WUFDcEcsTUFBTSxXQUFXLEdBQUcsSUFBSSw2QkFBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRW5FLG1HQUFtRztZQUNuRyxNQUFNLHFCQUFxQixHQUEwQixNQUFNLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFL0csZ0VBQWdFO1lBQ2hFLElBQUkscUJBQXFCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLElBQUkscUJBQXFCLENBQUMsSUFBSSxFQUFFO2dCQUNoSSw0R0FBNEc7Z0JBQzVHLFdBQVcsQ0FBQyxFQUFFLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDO2dCQUU1Qyw4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QUMsSUFBSTtRQUMxRSxRQUFRLENBQUMsSUFBSSxDQUFDLDJCQUEyQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyRyx1Q0FBdUM7UUFDdkMsT0FBTztZQUNILElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtTQUN0QixDQUFBO0tBQ0o7U0FBTTtRQUNILE1BQU0sWUFBWSxHQUFHLHFFQUFxRSxDQUFDO1FBQzNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFMUIsc0hBQXNIO1FBQ3RILE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSTtZQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO1lBQ2hELFlBQVksRUFBRSxZQUFZO1NBQzdCLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U1FTQmF0Y2hSZXNwb25zZSwgU1FTRXZlbnR9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5pbXBvcnQge1xuICAgIE1lbWJlckRldGFpbHNSZXNwb25zZSxcbiAgICBNb29uYmVhbUNsaWVudCxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudCxcbiAgICBUcmFuc2FjdGlvbixcbiAgICBUcmFuc2FjdGlvblJlc3BvbnNlLFxuICAgIFRyYW5zYWN0aW9uc0Vycm9yVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtTUVNCYXRjaEl0ZW1GYWlsdXJlfSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL3Nxc1wiO1xuXG4vKipcbiAqIE9mZmVyUmVkZWVtZWRQcm9jZXNzb3JIYW5kbGVyIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gZXZlbnQgdGhlIHtAbGluayBTUVNFdmVudH0gdG8gYmUgcHJvY2Vzc2VkLCBjb250YWluaW5nIHRoZSB0cmFuc2FjdGlvblxuICogbWVzc2FnZSBpbmZvcm1hdGlvblxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBTUVNCYXRjaFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgcHJvY2Vzc09mZmVyUmVkZWVtZWRUcmFuc2FjdGlvbnMgPSBhc3luYyAoZXZlbnQ6IFNRU0V2ZW50KTogUHJvbWlzZTxTUVNCYXRjaFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGluaXRpYWxpemluZyB0aGUgYmF0Y2ggcmVzcG9uc2UsIGFzIGFuIGVtcHR5IGFycmF5LCB0aGF0IHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggZXJyb3JzLCBpZiBhbnkgdGhyb3VnaG91dCB0aGUgcHJvY2Vzc2luZ1xuICAgICAgICAgKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkuIElmIHdlIHdhbnQgdG8gaW5kaWNhdGUgdGhhdCB0aGVyZSBoYXZlIGJlZW4gZXJyb3JzLFxuICAgICAgICAgKiBmb3IgZWFjaCBpbmRpdmlkdWFsIG1lc3NhZ2UsIGJhc2VkIG9uIGl0cyBJRCwgd2UgaGF2ZSB0byBhZGQgaXQgaW4gdGhlIGZpbmFsIGJhdGNoIHJlc3BvbnNlXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGl0ZW1GYWlsdXJlczogU1FTQmF0Y2hJdGVtRmFpbHVyZVtdID0gW107XG5cbiAgICAgICAgLy8gZm9yIGVhY2ggcmVjb3JkIGluIHRoZSBpbmNvbWluZyBldmVudCwgcmVwZWF0IHRoZSB0cmFuc2FjdGlvbiBwcm9jZXNzaW5nIHN0ZXBzXG4gICAgICAgIGZvciAoY29uc3QgdHJhbnNhY3Rpb25hbFJlY29yZCBvZiBldmVudC5SZWNvcmRzKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBvdmVyYWxsIHRyYW5zYWN0aW9uIHByb2Nlc3NpbmcsIHdpbGwgYmUgbWFkZSB1cCBvZiB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIDEpIENhbGwgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIChleHRNZW1iZXJJRCkgZm9yIG1lbWJlclxuICAgICAgICAgICAgICogMikgQ2FsbCB0aGUgR0VUIGJyYW5kIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBuYW1lIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICogMykgQ2FsbCB0aGUgR0VUIHN0b3JlIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBzdG9yZSBhZGRyZXNzIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICogNCkgQ29udmVydCBhbnkgbmVjZXNzYXJ5IHRpbWVzdGFtcHMgYW5kIGNyZWF0ZWQvdXBkYXRlZCBhdCB0aW1lcyB0byBhcHByb3ByaWF0ZSBmb3JtYXRzXG4gICAgICAgICAgICAgKiA1KSBDYWxsIHRoZSBjcmVhdGVUcmFuc2FjdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgdG8gc3RvcmUgdHJhbnNhY3Rpb24gaW4gRHluYW1vIERCXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAvLyBmaXJzdCwgY29udmVydCB0aGUgaW5jb21pbmcgZXZlbnQgbWVzc2FnZSBib2R5LCBpbnRvIGEgdHJhbnNhY3Rpb24gb2JqZWN0XG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb24gPSBKU09OLnBhcnNlKHRyYW5zYWN0aW9uYWxSZWNvcmQuYm9keSkgYXMgVHJhbnNhY3Rpb247XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgLy8gMSkgQ2FsbCB0aGUgR0VUIG1lbWJlciBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgbWVtYmVyIGRldGFpbHMgKGV4dE1lbWJlcklEKSBmb3IgbWVtYmVyXG4gICAgICAgICAgICBjb25zdCBtZW1iZXJEZXRhaWxzUmVzcG9uc2U6IE1lbWJlckRldGFpbHNSZXNwb25zZSA9IGF3YWl0IGdldE1lbWJlckRldGFpbHMob2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uLm1lbWJlcklkKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgaWYgKG1lbWJlckRldGFpbHNSZXNwb25zZSAmJiAhbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdHJhbnNhY3Rpb24gaWQsIHRvIGJlIHRoZSB1c2VySUQgbWFwcGVkIHRvIHRoZSBleHRNZW1iZXJJZCByZXRyaWV2ZWQgZnJvbSB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLmlkID0gbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGE7XG5cbiAgICAgICAgICAgICAgICAvLyAyKSBDYWxsIHRoZSBHRVQgYnJhbmQgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGJyYW5kIG5hbWUgZm9yIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgY29uc3QgYnJhbmREZXRhaWxzUmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBnZXRCcmFuZERldGFpbHMob2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgYnJhbmQgZGV0YWlscyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmIChicmFuZERldGFpbHNSZXNwb25zZSAmJiAhYnJhbmREZXRhaWxzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFicmFuZERldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAzKSBDYWxsIHRoZSBHRVQgc3RvcmUgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGJyYW5kIHN0b3JlIGFkZHJlc3MgZm9yIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0b3JlRGV0YWlsc1Jlc3BvbnNlOiBUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgZ2V0U3RvcmVEZXRhaWxzKG9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBzdG9yZSBkZXRhaWxzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdG9yZURldGFpbHNSZXNwb25zZSAmJiAhc3RvcmVEZXRhaWxzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFzdG9yZURldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgc3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNCkgQ29udmVydCBhbnkgbmVjZXNzYXJ5IHRpbWVzdGFtcHMgYW5kIGNyZWF0ZWQvdXBkYXRlZCBhdCB0aW1lcyB0byBhcHByb3ByaWF0ZSBmb3JtYXRzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVkQXRGb3JtYXR0ZWQgPSBuZXcgRGF0ZSh0cmFuc2FjdGlvbi5jcmVhdGVkQXQpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5jcmVhdGVkQXQgPSBjcmVhdGVkQXRGb3JtYXR0ZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi51cGRhdGVkQXQgPSBjcmVhdGVkQXRGb3JtYXR0ZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi50aW1lc3RhbXAgPSBEYXRlLnBhcnNlKGNyZWF0ZWRBdEZvcm1hdHRlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogNSkgQ2FsbCB0aGUgY3JlYXRlVHJhbnNhY3Rpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHN0b3JlIHRyYW5zYWN0aW9uIGluIER5bmFtbyBEQlxuICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGZpcnN0IGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgY3JlYXRlVHJhbnNhY3Rpb24gY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2U6IE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZVRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uIGFzIE1vb25iZWFtVHJhbnNhY3Rpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGNhcmQgbGlua2luZyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGluY29taW5nIGxpbmtlZCBkYXRhIGludG8gYSBDYXJkTGluayBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvblJlc3BvbnNlID0gcmVzcG9uc2UuZGF0YSBhcyBNb29uYmVhbVRyYW5zYWN0aW9uO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodHJhbnNhY3Rpb25SZXNwb25zZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciByZXR1cm5lZCBmcm9tIHRoZSBjcmVhdGVUcmFuc2FjdGlvbiBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN0b3JlIERldGFpbHMgbWFwcGluZyB0aHJvdWdoIEdFVCBzdG9yZSBkZXRhaWxzIGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiB0cmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQnJhbmQgRGV0YWlscyBtYXBwaW5nIHRocm91Z2ggR0VUIGJyYW5kIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVzZXJJRCBtYXBwaW5nIHRocm91Z2ggR0VUIG1lbWJlciBkZXRhaWxzIGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiB0cmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZvciB0aGUgTGFtYmRhIHRvIGluZGljYXRlIFNRUyB0aGF0IHRoZXJlIGhhdmUgYmVlbiBubyBmYWlsdXJlcywgYW5kIHRodXMgZW5hYmxlIHRoZSBkZWxldGlvbiBvZiBhbGwgcHJvY2Vzc2VkIG1lc3NhZ2VzXG4gICAgICAgICAqIGZyb20gdGhlIHF1ZXVlLCB3ZSBoYXZlIHRvIHJldHVybiBhbiBlbXB0eSBiYXRjaEl0ZW1GYWlsdXJlcyBhcnJheSBoZXJlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IGl0ZW1GYWlsdXJlc1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke0pTT04uc3RyaW5naWZ5KGV2ZW50KX0gdHJhbnNhY3Rpb25hbCBldmVudCAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm5zIGEgYmF0Y2ggcmVzcG9uc2UgZmFpbHVyZSBmb3IgdGhlIHBhcnRpY3VsYXIgbWVzc2FnZSBJRHMgd2hpY2ggZmFpbGVkXG4gICAgICAgICAqIGluIHRoaXMgY2FzZSwgdGhlIExhbWJkYSBmdW5jdGlvbiBET0VTIE5PVCBkZWxldGUgdGhlIGluY29taW5nIG1lc3NhZ2VzIGZyb20gdGhlIHF1ZXVlLCBhbmQgaXQgbWFrZXMgaXQgYXZhaWxhYmxlL3Zpc2libGUgYWdhaW5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBbe1xuICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGNhc2UsIHdlIG9ubHkgcHJvY2VzcyAxIHJlY29yZCBhdCBhIHRpbWUsIHdlIG1pZ2h0IG5lZWQgdG8gY2hhbmdlIHRoaXMgaW4gdGhlIGZ1dHVyZVxuICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBldmVudC5SZWNvcmRzWzBdLm1lc3NhZ2VJZFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBtZW1iZXIgZGV0YWlscyBvZiBhIHVzZXIsIHdoaWNoIGluY2x1ZGVzIHRoZSBleHRNZW1iZXJJZFxuICogb2YgYSBtZW1iZXIsIGRpcmVjdGx5IG1hcHBlZCB0byBhIE1vb25iZWFtIHVzZXJJZCwgdG8gYmUgdXNlZCB3aGVuIHN0b3JpbmcgYSB0cmFuc2FjdGlvbi5cbiAqXG4gKiBAcGFyYW0gb2xpdmVDbGllbnQgY2xpZW50IHVzZWQgdG8gbWFrZSBPbGl2ZSBBUEkgY2FsbHNcbiAqIEBwYXJhbSBtZW1iZXJJZCB0aGUgaWQgb2YgdGhlIG1lbWJlciwgb2J0YWluZWQgZnJvbSBPbGl2ZSB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlLFxuICogd2hpY2ggZGV0YWlscyBhcmUgcmV0cmlldmVkIGZvclxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNZW1iZXJEZXRhaWxzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgZGV0YWlscyBvZiBhIG1lbWJlclxuICogaW4gdGhlIGZvcm0gb2YgZWl0aGVyIGFuIGVycm9yLCBvciBhIHZhbGlkIHN0cmluZy1iYXNlZCByZXNwb25zZSBzaWduaWZ5aW5nIHRoZSBtZW1iZXIncyBleHRlcm5hbCBpZFxuICovXG5jb25zdCBnZXRNZW1iZXJEZXRhaWxzID0gYXN5bmMgKG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgbWVtYmVySWQ6IHN0cmluZyk6IFByb21pc2U8TWVtYmVyRGV0YWlsc1Jlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgbWVtYmVyIGRldGFpbHMgcmV0cmlldmFsIGNhbGwsIGluIG9yZGVyIHRvIGdldCB0aGUgTW9vbmJlYW0gdXNlcklkIHRvIGJlIHVzZWQgaW4gYXNzb2NpYXRpbmcgYSB0cmFuc2FjdGlvbiB3aXRoIGEgTW9vbmJlYW0gdXNlclxuICAgIGNvbnN0IHJlc3BvbnNlOiBNZW1iZXJEZXRhaWxzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRNZW1iZXJEZXRhaWxzKG1lbWJlcklkKTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHJldHVybnMgdGhlIHJlc3BvbnNlIGRhdGEgd2l0aCB0aGUgbWVtYmVyJ3MgZXh0ZXJuYWwgSUQsIHRvIGJlIG1hcHBlZCB0byBNb29uYmVhbSdzIHVzZXJJZFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIG1lbWJlciBkZXRhaWxzIGNhbGwhYDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBicmFuZCBkZXRhaWxzLCB3aGljaCBtYWlubHkgaW5jbHVkZSB0aGUgbmFtZSwgbG9nbyBhbmQgZGVzY3JpcHRpb25cbiAqIG9mIHRoZSBicmFuZCB0aGF0IHRoZSB0cmFuc2FjdGlvbiB3YXMgZXhlY3V0ZWQgYXQsIHRvIGJlIHVzZWQgd2hlbiBzdG9yaW5nIHRoZSB0cmFuc2FjdGlvbiBpbiB0aGUgREIuXG4gKlxuICogQHBhcmFtIG9saXZlQ2xpZW50IGNsaWVudCB1c2VkIHRvIG1ha2UgT2xpdmUgQVBJIGNhbGxzXG4gKiBAcGFyYW0gdHJhbnNhY3Rpb24gdGhlIHRyYW5zYWN0aW9uIG9iamVjdCBvYnRhaW5lZCBmcm9tIE9saXZlIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UsXG4gKiB3aGljaCBicmFuZCBkZXRhaWxzIG9idGFpbmVkIHRocm91Z2ggdGhpcyBjYWxsIGFyZSBhcHBlbmRlZCB0b1xuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uIGluZm9ybWF0aW9uIHBhc3NlZFxuICogaW4gdGhyb3VnaCB0aGUgU1FTIG1lc3NhZ2UsIGFsb25nc2lkZSB0aGUgYnJhbmQgZGV0YWlscyByZXRyaWV2ZWQgdGhyb3VnaCB0aGlzIGNhbGwuXG4gKi9cbmNvbnN0IGdldEJyYW5kRGV0YWlscyA9IGFzeW5jIChvbGl2ZUNsaWVudDogT2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbik6IFByb21pc2U8VHJhbnNhY3Rpb25SZXNwb25zZT4gPT4ge1xuICAgIC8vIGV4ZWN1dGUgdGhlIGJyYW5kIGRldGFpbHMgcmV0cmlldmFsIGNhbGwsIGluIG9yZGVyIHRvIGdldCB0aGUgYnJhbmQgZGV0YWlscyBmb3IgdGhlIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgY29uc3QgcmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRCcmFuZERldGFpbHModHJhbnNhY3Rpb24pO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBicmFuZCBkZXRhaWxzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmROYW1lICYmIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZE5hbWUubGVuZ3RoICE9PSAwICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZExvZ29VcmwgJiYgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTG9nb1VybC5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kRGVzY3JpcHRpb24gJiYgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kRGVzY3JpcHRpb24ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHJldHVybnMgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZGF0YVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGJyYW5kIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIHN0b3JlIGRldGFpbHMsIHdoaWNoIG1haW5seSBpbmNsdWRlIHRoZSBhZGRyZXNzIG9mIHRoZSBzdG9yZSwgYXNzb2NpYXRlZFxuICogd2l0aCB0aGUgYnJhbmQgdGhhdCB0aGUgdHJhbnNhY3Rpb24gd2FzIGV4ZWN1dGVkIGF0LCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyB0aGUgdHJhbnNhY3Rpb24gaW4gdGhlIERCLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIHRyYW5zYWN0aW9uIHRoZSB0cmFuc2FjdGlvbiBvYmplY3Qgb2J0YWluZWQgZnJvbSBPbGl2ZSB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlLFxuICogd2hpY2ggc3RvcmUgZGV0YWlscyBvYnRhaW5lZCB0aHJvdWdoIHRoaXMgY2FsbCBhcmUgYXBwZW5kZWQgdG9cbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbiBpbmZvcm1hdGlvbiBwYXNzZWRcbiAqIGluIHRocm91Z2ggdGhlIFNRUyBtZXNzYWdlLCBhbG9uZ3NpZGUgdGhlIHN0b3JlIGRldGFpbHMgcmV0cmlldmVkIHRocm91Z2ggdGhpcyBjYWxsLlxuICovXG5jb25zdCBnZXRTdG9yZURldGFpbHMgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb24pOiBQcm9taXNlPFRyYW5zYWN0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBleGVjdXRlIHRoZSBicmFuZCBkZXRhaWxzIHJldHJpZXZhbCBjYWxsLCBpbiBvcmRlciB0byBnZXQgdGhlIHN0b3JlIGRldGFpbHMgZm9yIHRoZSBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgIGNvbnN0IHJlc3BvbnNlOiBUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0U3RvcmVEZXRhaWxzKHRyYW5zYWN0aW9uKTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgc3RvcmUgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kRGVzY3JpcHRpb24gJiYgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kRGVzY3JpcHRpb24ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHJldHVybnMgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZGF0YVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHN0b3JlIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuIl19