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
             * (Note Step 0 is a pre-requisite in order for us to make sure that we do not incorrectly
             * process the click-based offers)
             * 0) Call the GET transaction details Olive API to retrieve the redeemed offer ID. Using that offer ID,
             * call the GET offer details Olive API to retrieve the offer type for this transaction.
             * If this offer type is click based and the status of the incoming transaction is PENDING,
             * then we do not need to go through steps 1-6 (so we do not get false-positives for the click-based offers).
             *
             * 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member.
             * 2) Call the GET brand details Olive API to retrieve the brand name for incoming transaction.
             * 3) Call the GET store details Olive API to retrieve the brand store address for incoming transaction.
             * 4) Call the GET transaction details Olive API to retrieve the actual purchase date/time for an incoming transaction.
             * 5) Convert any necessary timestamps and created/updated at times to appropriate formats.
             * 6) Call the createTransaction Moonbeam AppSync API endpoint, to store transaction in Dynamo DB.
             *
             * first, convert the incoming event message body, into a transaction object
             */
            const transaction = JSON.parse(transactionalRecord.body);
            // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
            /**
             * 0) Call the GET transaction details Olive API to retrieve the redeemed offer ID. Using that offer ID,
             * call the GET offer details Olive API to retrieve the offer type for this transaction.
             * If this offer type is click based and the status of the incoming transaction is PENDING,
             * then we do not need to go through steps 1-6 (so we do not get false-positives for the click-based offers).
             */
            const clickOfferRedemptionResponse = await getOfferRedemptionType(oliveClient, transaction.transactionId);
            // check to see if the offer redemption type call was successful or not
            if (clickOfferRedemptionResponse && !clickOfferRedemptionResponse.errorMessage && !clickOfferRedemptionResponse.errorType &&
                clickOfferRedemptionResponse.data) {
                /**
                 * If this offer type is click based and the status of the incoming transaction is PENDING,
                 * then we do not need to go through steps 1-6 (so we do not get false-positives for the click-based offers).
                 */
                if (!(transaction.transactionStatus === moonbeam_models_1.TransactionsStatus.Pending && clickOfferRedemptionResponse.data === moonbeam_models_1.RedemptionType.Click)) {
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
                                     * first initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this resolver
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
                else {
                    console.log(`Click-based transactional offer not eligible for further processing ${transaction.transactionId}`);
                }
            }
            else {
                console.log(`Failed to retrieve the redemption type for redeemed offer`);
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
 * Function used to retrieve the redemption type of offer, redeemed through a transaction, given its
 * transaction id.
 *
 * @param oliveClient client used to make Olive API calls
 * @param transactionId the id of the transactions which the offer redemption type is retrieved for
 *
 * @returns a {@link Promise} of {@link OfferRedemptionTypeResponse} representing the type of offer
 * redemption, for the offer redeemed through the observed transaction.
 */
const getOfferRedemptionType = async (oliveClient, transactionId) => {
    // execute the offer id retrieval call, in order to get the offer id used to check the redemption type for
    const offerIdResponse = await oliveClient.getOfferId(transactionId);
    // check to see if the offer id retrieval call was executed successfully
    if (offerIdResponse && !offerIdResponse.errorMessage && !offerIdResponse.errorType && offerIdResponse.data && offerIdResponse.data.length !== 0) {
        // given a successfully retrieved offer id, execute the offer redemption type retrieval call
        const offerRedemptionTypeResponse = await oliveClient.getOfferRedemptionType(offerIdResponse.data);
        // check to see if the redemption type retrieval call was executed successfully
        if (offerRedemptionTypeResponse && !offerRedemptionTypeResponse.errorMessage && !offerRedemptionTypeResponse.errorType &&
            offerRedemptionTypeResponse.data && offerRedemptionTypeResponse.data.length !== 0) {
            // return the type of redemption retrieved from the offer
            return {
                data: offerRedemptionTypeResponse.data
            };
        }
        else {
            const errorMessage = `Unexpected response structure returned from the offer redemption type retrieval call!`;
            console.log(errorMessage);
            // if there are errors associated with the call, just return the error message and error type from the upstream client
            return {
                data: null,
                errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
                errorMessage: errorMessage
            };
        }
    }
    else {
        const errorMessage = `Unexpected response structure returned from the offer id retrieval call!`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2ZmZXJSZWRlZW1lZFByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL09mZmVyUmVkZWVtZWRQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQWFtQztBQUduQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLGdDQUFnQyxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDakcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsaUZBQWlGO1FBQ2pGLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFrQkc7WUFDSCxNQUFNLFdBQVcsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQWdCLENBQUM7WUFFckYsb0dBQW9HO1lBQ3BHLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVuRTs7Ozs7ZUFLRztZQUNILE1BQU0sNEJBQTRCLEdBQWdDLE1BQU0sc0JBQXNCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUV2SSx1RUFBdUU7WUFDdkUsSUFBSSw0QkFBNEIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFlBQVksSUFBSSxDQUFDLDRCQUE0QixDQUFDLFNBQVM7Z0JBQ3JILDRCQUE0QixDQUFDLElBQUksRUFBRTtnQkFDbkM7OzttQkFHRztnQkFDSCxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEtBQUssb0NBQWtCLENBQUMsT0FBTyxJQUFJLDRCQUE0QixDQUFDLElBQUksS0FBSyxnQ0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUMvSCxtR0FBbUc7b0JBQ25HLE1BQU0scUJBQXFCLEdBQTBCLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFL0csZ0VBQWdFO29CQUNoRSxJQUFJLHFCQUFxQixJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxJQUFJLHFCQUFxQixDQUFDLElBQUksRUFBRTt3QkFDaEksNEdBQTRHO3dCQUM1RyxXQUFXLENBQUMsRUFBRSxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQzt3QkFFNUMsOEZBQThGO3dCQUM5RixNQUFNLG9CQUFvQixHQUF3QixNQUFNLGVBQWUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBRWxHLCtEQUErRDt3QkFDL0QsSUFBSSxvQkFBb0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUU7NEJBQzVILHVHQUF1Rzs0QkFDdkcsTUFBTSxvQkFBb0IsR0FBd0IsTUFBTSxlQUFlLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDOzRCQUVsRywrREFBK0Q7NEJBQy9ELElBQUksb0JBQW9CLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLElBQUksb0JBQW9CLENBQUMsSUFBSSxFQUFFO2dDQUM1SCxzSEFBc0g7Z0NBQ3RILE1BQU0sMEJBQTBCLEdBQXdCLE1BQU0scUJBQXFCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dDQUU5RyxxRUFBcUU7Z0NBQ3JFLElBQUksMEJBQTBCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLElBQUksMEJBQTBCLENBQUMsSUFBSSxFQUFFO29DQUNwSiwwRkFBMEY7b0NBQzFGLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO29DQUN6RSxXQUFXLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO29DQUMzQyxXQUFXLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO29DQUUzQzs7Ozt1Q0FJRztvQ0FDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7b0NBRXpFLHFDQUFxQztvQ0FDckMsTUFBTSxRQUFRLEdBQWdDLE1BQU0sY0FBYyxDQUFDLGlCQUFpQixDQUFDLFdBQWtDLENBQUMsQ0FBQztvQ0FFekgsa0VBQWtFO29DQUNsRSxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxZQUFZLElBQUksUUFBUSxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFO3dDQUM1RixPQUFPLENBQUMsR0FBRyxDQUFDLHVGQUF1RixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3Q0FFaEksbUdBQW1HO3dDQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDOzRDQUNkLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTO3lDQUNoRCxDQUFDLENBQUM7cUNBQ047aUNBQ0o7cUNBQU07b0NBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO29DQUV2RixtR0FBbUc7b0NBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUM7d0NBQ2QsY0FBYyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7cUNBQ2hELENBQUMsQ0FBQztpQ0FDTjs2QkFDSjtpQ0FBTTtnQ0FDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7Z0NBRTNFLG1HQUFtRztnQ0FDbkcsWUFBWSxDQUFDLElBQUksQ0FBQztvQ0FDZCxjQUFjLEVBQUUsbUJBQW1CLENBQUMsU0FBUztpQ0FDaEQsQ0FBQyxDQUFDOzZCQUNOO3lCQUNKOzZCQUFNOzRCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQzs0QkFFM0UsbUdBQW1HOzRCQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO2dDQUNkLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTOzZCQUNoRCxDQUFDLENBQUM7eUJBQ047cUJBQ0o7eUJBQU07d0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO3dCQUVyRSxtR0FBbUc7d0JBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUM7NEJBQ2QsY0FBYyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7eUJBQ2hELENBQUMsQ0FBQztxQkFDTjtpQkFDSjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHVFQUF1RSxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztpQkFDbkg7YUFDSjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7Z0JBRXpFLG1HQUFtRztnQkFDbkcsWUFBWSxDQUFDLElBQUksQ0FBQztvQkFDZCxjQUFjLEVBQUUsbUJBQW1CLENBQUMsU0FBUztpQkFDaEQsQ0FBQyxDQUFDO2FBQ047U0FDSjtRQUVEOzs7OztXQUtHO1FBQ0gsT0FBTztZQUNILGlCQUFpQixFQUFFLFlBQVk7U0FDbEMsQ0FBQTtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUV2Rzs7Ozs7V0FLRztRQUNILE9BQU87WUFDSCxpQkFBaUIsRUFBRSxDQUFDO29CQUNoQixnR0FBZ0c7b0JBQ2hHLGNBQWMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQzdDLENBQUM7U0FDTCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUEvS1ksUUFBQSxnQ0FBZ0Msb0NBK0s1QztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLFdBQXdCLEVBQUUsYUFBcUIsRUFBd0MsRUFBRTtJQUMzSCwwR0FBMEc7SUFDMUcsTUFBTSxlQUFlLEdBQW9CLE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVyRix3RUFBd0U7SUFDeEUsSUFBSSxlQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsSUFBSSxlQUFlLENBQUMsSUFBSSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUM3SSw0RkFBNEY7UUFDNUYsTUFBTSwyQkFBMkIsR0FBZ0MsTUFBTSxXQUFXLENBQUMsc0JBQXNCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhJLCtFQUErRTtRQUMvRSxJQUFJLDJCQUEyQixJQUFJLENBQUMsMkJBQTJCLENBQUMsWUFBWSxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUztZQUNsSCwyQkFBMkIsQ0FBQyxJQUFJLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbkYseURBQXlEO1lBQ3pELE9BQU87Z0JBQ0gsSUFBSSxFQUFFLDJCQUEyQixDQUFDLElBQUk7YUFDekMsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyx1RkFBdUYsQ0FBQztZQUM3RyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLHNIQUFzSDtZQUN0SCxPQUFPO2dCQUNILElBQUksRUFBRSxJQUFJO2dCQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO2dCQUNoRCxZQUFZLEVBQUUsWUFBWTthQUM3QixDQUFBO1NBQ0o7S0FDSjtTQUFNO1FBQ0gsTUFBTSxZQUFZLEdBQUcsMEVBQTBFLENBQUM7UUFDaEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxQixzSEFBc0g7UUFDdEgsT0FBTztZQUNILElBQUksRUFBRSxJQUFJO1lBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7WUFDaEQsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLFdBQXdCLEVBQUUsUUFBZ0IsRUFBa0MsRUFBRTtJQUMxRyw4SUFBOEk7SUFDOUksTUFBTSxRQUFRLEdBQTBCLE1BQU0sV0FBVyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXJGLG9FQUFvRTtJQUNwRSxJQUFJLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzFHLDZGQUE2RjtRQUM3RixPQUFPO1lBQ0gsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1NBQ3RCLENBQUE7S0FDSjtTQUFNO1FBQ0gsTUFBTSxZQUFZLEdBQUcsc0VBQXNFLENBQUM7UUFDNUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxQixzSEFBc0g7UUFDdEgsT0FBTztZQUNILElBQUksRUFBRSxJQUFJO1lBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7WUFDaEQsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxXQUF3QixFQUFFLFdBQXdCLEVBQWdDLEVBQUU7SUFDL0csMkdBQTJHO0lBQzNHLE1BQU0sUUFBUSxHQUF3QixNQUFNLFdBQVcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFckYsbUVBQW1FO0lBQ25FLElBQUksUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUk7UUFDMUUsUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQ3JGLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUMzRixRQUFRLENBQUMsSUFBSSxDQUFDLDBCQUEwQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuRyx1Q0FBdUM7UUFDdkMsT0FBTztZQUNILElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtTQUN0QixDQUFBO0tBQ0o7U0FBTTtRQUNILE1BQU0sWUFBWSxHQUFHLHFFQUFxRSxDQUFDO1FBQzNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFMUIsc0hBQXNIO1FBQ3RILE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSTtZQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO1lBQ2hELFlBQVksRUFBRSxZQUFZO1NBQzdCLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsV0FBd0IsRUFBRSxXQUF3QixFQUFnQyxFQUFFO0lBQy9HLDJHQUEyRztJQUMzRyxNQUFNLFFBQVEsR0FBd0IsTUFBTSxXQUFXLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRXJGLG1FQUFtRTtJQUNuRSxJQUFJLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJO1FBQzFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUMzRixRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixLQUFLLElBQUksRUFBRTtRQUM1Qyx1Q0FBdUM7UUFDdkMsT0FBTztZQUNILElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtTQUN0QixDQUFBO0tBQ0o7U0FBTTtRQUNILE1BQU0sWUFBWSxHQUFHLHFFQUFxRSxDQUFDO1FBQzNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFMUIsc0hBQXNIO1FBQ3RILE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSTtZQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO1lBQ2hELFlBQVksRUFBRSxZQUFZO1NBQzdCLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLHFCQUFxQixHQUFHLEtBQUssRUFBRSxXQUF3QixFQUFFLFdBQXdCLEVBQWdDLEVBQUU7SUFDckgsOEhBQThIO0lBQzlILE1BQU0sUUFBUSxHQUF3QixNQUFNLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUzRix5RUFBeUU7SUFDekUsSUFBSSxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSTtRQUMxRSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLEVBQUU7UUFDMUQsdUNBQXVDO1FBQ3ZDLE9BQU87WUFDSCxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7U0FDdEIsQ0FBQTtLQUNKO1NBQU07UUFDSCxNQUFNLFlBQVksR0FBRywyRUFBMkUsQ0FBQztRQUNqRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFCLHNIQUFzSDtRQUN0SCxPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUk7WUFDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtZQUNoRCxZQUFZLEVBQUUsWUFBWTtTQUM3QixDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NRU0JhdGNoUmVzcG9uc2UsIFNRU0V2ZW50fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtcbiAgICBNZW1iZXJEZXRhaWxzUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbixcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2UsXG4gICAgT2ZmZXJJZFJlc3BvbnNlLFxuICAgIE9mZmVyUmVkZW1wdGlvblR5cGVSZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudCxcbiAgICBSZWRlbXB0aW9uVHlwZSxcbiAgICBUcmFuc2FjdGlvbixcbiAgICBUcmFuc2FjdGlvblJlc3BvbnNlLFxuICAgIFRyYW5zYWN0aW9uc0Vycm9yVHlwZSxcbiAgICBUcmFuc2FjdGlvbnNTdGF0dXNcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7U1FTQmF0Y2hJdGVtRmFpbHVyZX0gZnJvbSBcImF3cy1sYW1iZGEvdHJpZ2dlci9zcXNcIjtcblxuLyoqXG4gKiBPZmZlclJlZGVlbWVkUHJvY2Vzc29ySGFuZGxlciBoYW5kbGVyXG4gKlxuICogQHBhcmFtIGV2ZW50IHRoZSB7QGxpbmsgU1FTRXZlbnR9IHRvIGJlIHByb2Nlc3NlZCwgY29udGFpbmluZyB0aGUgdHJhbnNhY3Rpb25cbiAqIG1lc3NhZ2UgaW5mb3JtYXRpb25cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgU1FTQmF0Y2hSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHByb2Nlc3NPZmZlclJlZGVlbWVkVHJhbnNhY3Rpb25zID0gYXN5bmMgKGV2ZW50OiBTUVNFdmVudCk6IFByb21pc2U8U1FTQmF0Y2hSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpbml0aWFsaXppbmcgdGhlIGJhdGNoIHJlc3BvbnNlLCBhcyBhbiBlbXB0eSBhcnJheSwgdGhhdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGVycm9ycywgaWYgYW55IHRocm91Z2hvdXQgdGhlIHByb2Nlc3NpbmdcbiAgICAgICAgICpcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5LiBJZiB3ZSB3YW50IHRvIGluZGljYXRlIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIGVycm9ycyxcbiAgICAgICAgICogZm9yIGVhY2ggaW5kaXZpZHVhbCBtZXNzYWdlLCBiYXNlZCBvbiBpdHMgSUQsIHdlIGhhdmUgdG8gYWRkIGl0IGluIHRoZSBmaW5hbCBiYXRjaCByZXNwb25zZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpdGVtRmFpbHVyZXM6IFNRU0JhdGNoSXRlbUZhaWx1cmVbXSA9IFtdO1xuXG4gICAgICAgIC8vIGZvciBlYWNoIHJlY29yZCBpbiB0aGUgaW5jb21pbmcgZXZlbnQsIHJlcGVhdCB0aGUgdHJhbnNhY3Rpb24gcHJvY2Vzc2luZyBzdGVwc1xuICAgICAgICBmb3IgKGNvbnN0IHRyYW5zYWN0aW9uYWxSZWNvcmQgb2YgZXZlbnQuUmVjb3Jkcykge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3ZlcmFsbCB0cmFuc2FjdGlvbiBwcm9jZXNzaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiAoTm90ZSBTdGVwIDAgaXMgYSBwcmUtcmVxdWlzaXRlIGluIG9yZGVyIGZvciB1cyB0byBtYWtlIHN1cmUgdGhhdCB3ZSBkbyBub3QgaW5jb3JyZWN0bHlcbiAgICAgICAgICAgICAqIHByb2Nlc3MgdGhlIGNsaWNrLWJhc2VkIG9mZmVycylcbiAgICAgICAgICAgICAqIDApIENhbGwgdGhlIEdFVCB0cmFuc2FjdGlvbiBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgcmVkZWVtZWQgb2ZmZXIgSUQuIFVzaW5nIHRoYXQgb2ZmZXIgSUQsXG4gICAgICAgICAgICAgKiBjYWxsIHRoZSBHRVQgb2ZmZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG9mZmVyIHR5cGUgZm9yIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgICAgICAgICAgKiBJZiB0aGlzIG9mZmVyIHR5cGUgaXMgY2xpY2sgYmFzZWQgYW5kIHRoZSBzdGF0dXMgb2YgdGhlIGluY29taW5nIHRyYW5zYWN0aW9uIGlzIFBFTkRJTkcsXG4gICAgICAgICAgICAgKiB0aGVuIHdlIGRvIG5vdCBuZWVkIHRvIGdvIHRocm91Z2ggc3RlcHMgMS02IChzbyB3ZSBkbyBub3QgZ2V0IGZhbHNlLXBvc2l0aXZlcyBmb3IgdGhlIGNsaWNrLWJhc2VkIG9mZmVycykuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogMSkgQ2FsbCB0aGUgR0VUIG1lbWJlciBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgbWVtYmVyIGRldGFpbHMgKGV4dE1lbWJlcklEKSBmb3IgbWVtYmVyLlxuICAgICAgICAgICAgICogMikgQ2FsbCB0aGUgR0VUIGJyYW5kIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBuYW1lIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvbi5cbiAgICAgICAgICAgICAqIDMpIENhbGwgdGhlIEdFVCBzdG9yZSBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgYnJhbmQgc3RvcmUgYWRkcmVzcyBmb3IgaW5jb21pbmcgdHJhbnNhY3Rpb24uXG4gICAgICAgICAgICAgKiA0KSBDYWxsIHRoZSBHRVQgdHJhbnNhY3Rpb24gZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGFjdHVhbCBwdXJjaGFzZSBkYXRlL3RpbWUgZm9yIGFuIGluY29taW5nIHRyYW5zYWN0aW9uLlxuICAgICAgICAgICAgICogNSkgQ29udmVydCBhbnkgbmVjZXNzYXJ5IHRpbWVzdGFtcHMgYW5kIGNyZWF0ZWQvdXBkYXRlZCBhdCB0aW1lcyB0byBhcHByb3ByaWF0ZSBmb3JtYXRzLlxuICAgICAgICAgICAgICogNikgQ2FsbCB0aGUgY3JlYXRlVHJhbnNhY3Rpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHN0b3JlIHRyYW5zYWN0aW9uIGluIER5bmFtbyBEQi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBmaXJzdCwgY29udmVydCB0aGUgaW5jb21pbmcgZXZlbnQgbWVzc2FnZSBib2R5LCBpbnRvIGEgdHJhbnNhY3Rpb24gb2JqZWN0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbiA9IEpTT04ucGFyc2UodHJhbnNhY3Rpb25hbFJlY29yZC5ib2R5KSBhcyBUcmFuc2FjdGlvbjtcblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIDApIENhbGwgdGhlIEdFVCB0cmFuc2FjdGlvbiBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgcmVkZWVtZWQgb2ZmZXIgSUQuIFVzaW5nIHRoYXQgb2ZmZXIgSUQsXG4gICAgICAgICAgICAgKiBjYWxsIHRoZSBHRVQgb2ZmZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG9mZmVyIHR5cGUgZm9yIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgICAgICAgICAgKiBJZiB0aGlzIG9mZmVyIHR5cGUgaXMgY2xpY2sgYmFzZWQgYW5kIHRoZSBzdGF0dXMgb2YgdGhlIGluY29taW5nIHRyYW5zYWN0aW9uIGlzIFBFTkRJTkcsXG4gICAgICAgICAgICAgKiB0aGVuIHdlIGRvIG5vdCBuZWVkIHRvIGdvIHRocm91Z2ggc3RlcHMgMS02IChzbyB3ZSBkbyBub3QgZ2V0IGZhbHNlLXBvc2l0aXZlcyBmb3IgdGhlIGNsaWNrLWJhc2VkIG9mZmVycykuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGNsaWNrT2ZmZXJSZWRlbXB0aW9uUmVzcG9uc2U6IE9mZmVyUmVkZW1wdGlvblR5cGVSZXNwb25zZSA9IGF3YWl0IGdldE9mZmVyUmVkZW1wdGlvblR5cGUob2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uSWQpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG9mZmVyIHJlZGVtcHRpb24gdHlwZSBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgaWYgKGNsaWNrT2ZmZXJSZWRlbXB0aW9uUmVzcG9uc2UgJiYgIWNsaWNrT2ZmZXJSZWRlbXB0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFjbGlja09mZmVyUmVkZW1wdGlvblJlc3BvbnNlLmVycm9yVHlwZSAmJlxuICAgICAgICAgICAgICAgIGNsaWNrT2ZmZXJSZWRlbXB0aW9uUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIElmIHRoaXMgb2ZmZXIgdHlwZSBpcyBjbGljayBiYXNlZCBhbmQgdGhlIHN0YXR1cyBvZiB0aGUgaW5jb21pbmcgdHJhbnNhY3Rpb24gaXMgUEVORElORyxcbiAgICAgICAgICAgICAgICAgKiB0aGVuIHdlIGRvIG5vdCBuZWVkIHRvIGdvIHRocm91Z2ggc3RlcHMgMS02IChzbyB3ZSBkbyBub3QgZ2V0IGZhbHNlLXBvc2l0aXZlcyBmb3IgdGhlIGNsaWNrLWJhc2VkIG9mZmVycykuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKCEodHJhbnNhY3Rpb24udHJhbnNhY3Rpb25TdGF0dXMgPT09IFRyYW5zYWN0aW9uc1N0YXR1cy5QZW5kaW5nICYmIGNsaWNrT2ZmZXJSZWRlbXB0aW9uUmVzcG9uc2UuZGF0YSA9PT0gUmVkZW1wdGlvblR5cGUuQ2xpY2spKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIDEpIENhbGwgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIChleHRNZW1iZXJJRCkgZm9yIG1lbWJlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJEZXRhaWxzUmVzcG9uc2U6IE1lbWJlckRldGFpbHNSZXNwb25zZSA9IGF3YWl0IGdldE1lbWJlckRldGFpbHMob2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uLm1lbWJlcklkKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG1lbWJlciBkZXRhaWxzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZW1iZXJEZXRhaWxzUmVzcG9uc2UgJiYgIW1lbWJlckRldGFpbHNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIW1lbWJlckRldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdHJhbnNhY3Rpb24gaWQsIHRvIGJlIHRoZSB1c2VySUQgbWFwcGVkIHRvIHRoZSBleHRNZW1iZXJJZCByZXRyaWV2ZWQgZnJvbSB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24uaWQgPSBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMikgQ2FsbCB0aGUgR0VUIGJyYW5kIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSBicmFuZCBuYW1lIGZvciBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYnJhbmREZXRhaWxzUmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBnZXRCcmFuZERldGFpbHMob2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBicmFuZCBkZXRhaWxzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnJhbmREZXRhaWxzUmVzcG9uc2UgJiYgIWJyYW5kRGV0YWlsc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYnJhbmREZXRhaWxzUmVzcG9uc2UuZXJyb3JUeXBlICYmIGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAzKSBDYWxsIHRoZSBHRVQgc3RvcmUgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGJyYW5kIHN0b3JlIGFkZHJlc3MgZm9yIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RvcmVEZXRhaWxzUmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBnZXRTdG9yZURldGFpbHMob2xpdmVDbGllbnQsIHRyYW5zYWN0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgc3RvcmUgZGV0YWlscyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdG9yZURldGFpbHNSZXNwb25zZSAmJiAhc3RvcmVEZXRhaWxzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFzdG9yZURldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgc3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA0KSBDYWxsIHRoZSBHRVQgdHJhbnNhY3Rpb24gZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGFjdHVhbCBwdXJjaGFzZSBkYXRlL3RpbWUgZm9yIGFuIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlOiBUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgZ2V0VHJhbnNhY3Rpb25EZXRhaWxzKG9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZSAmJiAhdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICF0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gNSkgQ29udmVydCBhbnkgbmVjZXNzYXJ5IHRpbWVzdGFtcHMgYW5kIGNyZWF0ZWQvdXBkYXRlZCBhdCB0aW1lcyB0byBhcHByb3ByaWF0ZSBmb3JtYXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVkQXRGb3JtYXR0ZWQgPSBuZXcgRGF0ZSh0cmFuc2FjdGlvbi5jcmVhdGVkQXQpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5jcmVhdGVkQXQgPSBjcmVhdGVkQXRGb3JtYXR0ZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi51cGRhdGVkQXQgPSBjcmVhdGVkQXRGb3JtYXR0ZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogNikgQ2FsbCB0aGUgY3JlYXRlVHJhbnNhY3Rpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHN0b3JlIHRyYW5zYWN0aW9uIGluIER5bmFtbyBEQlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGZpcnN0IGluaXRpYWxpemUgdGhlIE1vb25iZWFtIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgY3JlYXRlVHJhbnNhY3Rpb24gY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2U6IE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZVRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uIGFzIE1vb25iZWFtVHJhbnNhY3Rpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGNhcmQgbGlua2luZyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UgfHwgcmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8IHJlc3BvbnNlLmVycm9yVHlwZSB8fCAhcmVzcG9uc2UuZGF0YSB8fCAhcmVzcG9uc2UuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciBhbmQvb3IgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGNyZWF0ZVRyYW5zYWN0aW9uIGNhbGwgJHtKU09OLnN0cmluZ2lmeShyZXNwb25zZSl9IWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBUcmFuc2FjdGlvbiBEZXRhaWxzIG1hcHBpbmcgdGhyb3VnaCBHRVQgdHJhbnNhY3Rpb24gZGV0YWlscyBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN0b3JlIERldGFpbHMgbWFwcGluZyB0aHJvdWdoIEdFVCBzdG9yZSBkZXRhaWxzIGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiB0cmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCcmFuZCBEZXRhaWxzIG1hcHBpbmcgdGhyb3VnaCBHRVQgYnJhbmQgZGV0YWlscyBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVc2VySUQgbWFwcGluZyB0aHJvdWdoIEdFVCBtZW1iZXIgZGV0YWlscyBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYENsaWNrLWJhc2VkIHRyYW5zYWN0aW9uYWwgb2ZmZXIgbm90IGVsaWdpYmxlIGZvciBmdXJ0aGVyIHByb2Nlc3NpbmcgJHt0cmFuc2FjdGlvbi50cmFuc2FjdGlvbklkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEZhaWxlZCB0byByZXRyaWV2ZSB0aGUgcmVkZW1wdGlvbiB0eXBlIGZvciByZWRlZW1lZCBvZmZlcmApO1xuXG4gICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkgaGVyZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBpdGVtRmFpbHVyZXNcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgJHtKU09OLnN0cmluZ2lmeShldmVudCl9IHRyYW5zYWN0aW9uYWwgZXZlbnQgJHtlcnJvcn1gKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogcmV0dXJucyBhIGJhdGNoIHJlc3BvbnNlIGZhaWx1cmUgZm9yIHRoZSBwYXJ0aWN1bGFyIG1lc3NhZ2UgSURzIHdoaWNoIGZhaWxlZFxuICAgICAgICAgKiBpbiB0aGlzIGNhc2UsIHRoZSBMYW1iZGEgZnVuY3Rpb24gRE9FUyBOT1QgZGVsZXRlIHRoZSBpbmNvbWluZyBtZXNzYWdlcyBmcm9tIHRoZSBxdWV1ZSwgYW5kIGl0IG1ha2VzIGl0IGF2YWlsYWJsZS92aXNpYmxlIGFnYWluXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiYXRjaEl0ZW1GYWlsdXJlczogW3tcbiAgICAgICAgICAgICAgICAvLyBmb3IgdGhpcyBjYXNlLCB3ZSBvbmx5IHByb2Nlc3MgMSByZWNvcmQgYXQgYSB0aW1lLCB3ZSBtaWdodCBuZWVkIHRvIGNoYW5nZSB0aGlzIGluIHRoZSBmdXR1cmVcbiAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogZXZlbnQuUmVjb3Jkc1swXS5tZXNzYWdlSWRcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgcmVkZW1wdGlvbiB0eXBlIG9mIG9mZmVyLCByZWRlZW1lZCB0aHJvdWdoIGEgdHJhbnNhY3Rpb24sIGdpdmVuIGl0c1xuICogdHJhbnNhY3Rpb24gaWQuXG4gKlxuICogQHBhcmFtIG9saXZlQ2xpZW50IGNsaWVudCB1c2VkIHRvIG1ha2UgT2xpdmUgQVBJIGNhbGxzXG4gKiBAcGFyYW0gdHJhbnNhY3Rpb25JZCB0aGUgaWQgb2YgdGhlIHRyYW5zYWN0aW9ucyB3aGljaCB0aGUgb2ZmZXIgcmVkZW1wdGlvbiB0eXBlIGlzIHJldHJpZXZlZCBmb3JcbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgT2ZmZXJSZWRlbXB0aW9uVHlwZVJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHR5cGUgb2Ygb2ZmZXJcbiAqIHJlZGVtcHRpb24sIGZvciB0aGUgb2ZmZXIgcmVkZWVtZWQgdGhyb3VnaCB0aGUgb2JzZXJ2ZWQgdHJhbnNhY3Rpb24uXG4gKi9cbmNvbnN0IGdldE9mZmVyUmVkZW1wdGlvblR5cGUgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbklkOiBzdHJpbmcpOiBQcm9taXNlPE9mZmVyUmVkZW1wdGlvblR5cGVSZXNwb25zZT4gPT4ge1xuICAgIC8vIGV4ZWN1dGUgdGhlIG9mZmVyIGlkIHJldHJpZXZhbCBjYWxsLCBpbiBvcmRlciB0byBnZXQgdGhlIG9mZmVyIGlkIHVzZWQgdG8gY2hlY2sgdGhlIHJlZGVtcHRpb24gdHlwZSBmb3JcbiAgICBjb25zdCBvZmZlcklkUmVzcG9uc2U6IE9mZmVySWRSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE9mZmVySWQodHJhbnNhY3Rpb25JZCk7XG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG9mZmVyIGlkIHJldHJpZXZhbCBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAob2ZmZXJJZFJlc3BvbnNlICYmICFvZmZlcklkUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFvZmZlcklkUmVzcG9uc2UuZXJyb3JUeXBlICYmIG9mZmVySWRSZXNwb25zZS5kYXRhICYmIG9mZmVySWRSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAvLyBnaXZlbiBhIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgb2ZmZXIgaWQsIGV4ZWN1dGUgdGhlIG9mZmVyIHJlZGVtcHRpb24gdHlwZSByZXRyaWV2YWwgY2FsbFxuICAgICAgICBjb25zdCBvZmZlclJlZGVtcHRpb25UeXBlUmVzcG9uc2U6IE9mZmVyUmVkZW1wdGlvblR5cGVSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE9mZmVyUmVkZW1wdGlvblR5cGUob2ZmZXJJZFJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVkZW1wdGlvbiB0eXBlIHJldHJpZXZhbCBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgaWYgKG9mZmVyUmVkZW1wdGlvblR5cGVSZXNwb25zZSAmJiAhb2ZmZXJSZWRlbXB0aW9uVHlwZVJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhb2ZmZXJSZWRlbXB0aW9uVHlwZVJlc3BvbnNlLmVycm9yVHlwZSAmJlxuICAgICAgICAgICAgb2ZmZXJSZWRlbXB0aW9uVHlwZVJlc3BvbnNlLmRhdGEgJiYgb2ZmZXJSZWRlbXB0aW9uVHlwZVJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHR5cGUgb2YgcmVkZW1wdGlvbiByZXRyaWV2ZWQgZnJvbSB0aGUgb2ZmZXJcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJSZWRlbXB0aW9uVHlwZVJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBvZmZlciByZWRlbXB0aW9uIHR5cGUgcmV0cmlldmFsIGNhbGwhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBvZmZlciBpZCByZXRyaWV2YWwgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIG9mIGEgdXNlciwgd2hpY2ggaW5jbHVkZXMgdGhlIGV4dE1lbWJlcklkXG4gKiBvZiBhIG1lbWJlciwgZGlyZWN0bHkgbWFwcGVkIHRvIGEgTW9vbmJlYW0gdXNlcklkLCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyBhIHRyYW5zYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIG1lbWJlcklkIHRoZSBpZCBvZiB0aGUgbWVtYmVyLCBvYnRhaW5lZCBmcm9tIE9saXZlIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UsXG4gKiB3aGljaCBkZXRhaWxzIGFyZSByZXRyaWV2ZWQgZm9yXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1lbWJlckRldGFpbHNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBkZXRhaWxzIG9mIGEgbWVtYmVyXG4gKiBpbiB0aGUgZm9ybSBvZiBlaXRoZXIgYW4gZXJyb3IsIG9yIGEgdmFsaWQgc3RyaW5nLWJhc2VkIHJlc3BvbnNlIHNpZ25pZnlpbmcgdGhlIG1lbWJlcidzIGV4dGVybmFsIGlkXG4gKi9cbmNvbnN0IGdldE1lbWJlckRldGFpbHMgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCBtZW1iZXJJZDogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXJEZXRhaWxzUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBleGVjdXRlIHRoZSBtZW1iZXIgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBNb29uYmVhbSB1c2VySWQgdG8gYmUgdXNlZCBpbiBhc3NvY2lhdGluZyBhIHRyYW5zYWN0aW9uIHdpdGggYSBNb29uYmVhbSB1c2VyXG4gICAgY29uc3QgcmVzcG9uc2U6IE1lbWJlckRldGFpbHNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE1lbWJlckRldGFpbHMobWVtYmVySWQpO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBtZW1iZXIncyBleHRlcm5hbCBJRCwgdG8gYmUgbWFwcGVkIHRvIE1vb25iZWFtJ3MgdXNlcklkXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIGJyYW5kIGRldGFpbHMsIHdoaWNoIG1haW5seSBpbmNsdWRlIHRoZSBuYW1lLCBsb2dvIGFuZCBkZXNjcmlwdGlvblxuICogb2YgdGhlIGJyYW5kIHRoYXQgdGhlIHRyYW5zYWN0aW9uIHdhcyBleGVjdXRlZCBhdCwgdG8gYmUgdXNlZCB3aGVuIHN0b3JpbmcgdGhlIHRyYW5zYWN0aW9uIGluIHRoZSBEQi5cbiAqXG4gKiBAcGFyYW0gb2xpdmVDbGllbnQgY2xpZW50IHVzZWQgdG8gbWFrZSBPbGl2ZSBBUEkgY2FsbHNcbiAqIEBwYXJhbSB0cmFuc2FjdGlvbiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0IG9idGFpbmVkIGZyb20gT2xpdmUgdGhyb3VnaCB0aGUgdHJhbnNhY3Rpb24gbWVzc2FnZSxcbiAqIHdoaWNoIGJyYW5kIGRldGFpbHMgb2J0YWluZWQgdGhyb3VnaCB0aGlzIGNhbGwgYXJlIGFwcGVuZGVkIHRvXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFRyYW5zYWN0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb24gaW5mb3JtYXRpb24gcGFzc2VkXG4gKiBpbiB0aHJvdWdoIHRoZSBTUVMgbWVzc2FnZSwgYWxvbmdzaWRlIHRoZSBicmFuZCBkZXRhaWxzIHJldHJpZXZlZCB0aHJvdWdoIHRoaXMgY2FsbC5cbiAqL1xuY29uc3QgZ2V0QnJhbmREZXRhaWxzID0gYXN5bmMgKG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uKTogUHJvbWlzZTxUcmFuc2FjdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgYnJhbmQgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBicmFuZCBkZXRhaWxzIGZvciB0aGUgaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICBjb25zdCByZXNwb25zZTogVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldEJyYW5kRGV0YWlscyh0cmFuc2FjdGlvbik7XG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGJyYW5kIGRldGFpbHMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZE5hbWUgJiYgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTmFtZS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kTG9nb1VybCAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzICYmIHJlc3BvbnNlLmRhdGEudHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHJldHVybnMgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZGF0YVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGJyYW5kIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIHN0b3JlIGRldGFpbHMsIHdoaWNoIG1haW5seSBpbmNsdWRlIHRoZSBhZGRyZXNzIG9mIHRoZSBzdG9yZSwgYXNzb2NpYXRlZFxuICogd2l0aCB0aGUgYnJhbmQgdGhhdCB0aGUgdHJhbnNhY3Rpb24gd2FzIGV4ZWN1dGVkIGF0LCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyB0aGUgdHJhbnNhY3Rpb24gaW4gdGhlIERCLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIHRyYW5zYWN0aW9uIHRoZSB0cmFuc2FjdGlvbiBvYmplY3Qgb2J0YWluZWQgZnJvbSBPbGl2ZSB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlLFxuICogd2hpY2ggc3RvcmUgZGV0YWlscyBvYnRhaW5lZCB0aHJvdWdoIHRoaXMgY2FsbCBhcmUgYXBwZW5kZWQgdG9cbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbiBpbmZvcm1hdGlvbiBwYXNzZWRcbiAqIGluIHRocm91Z2ggdGhlIFNRUyBtZXNzYWdlLCBhbG9uZ3NpZGUgdGhlIHN0b3JlIGRldGFpbHMgcmV0cmlldmVkIHRocm91Z2ggdGhpcyBjYWxsLlxuICovXG5jb25zdCBnZXRTdG9yZURldGFpbHMgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCB0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb24pOiBQcm9taXNlPFRyYW5zYWN0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBleGVjdXRlIHRoZSBicmFuZCBkZXRhaWxzIHJldHJpZXZhbCBjYWxsLCBpbiBvcmRlciB0byBnZXQgdGhlIHN0b3JlIGRldGFpbHMgZm9yIHRoZSBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgIGNvbnN0IHJlc3BvbnNlOiBUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0U3RvcmVEZXRhaWxzKHRyYW5zYWN0aW9uKTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgc3RvcmUgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS50cmFuc2FjdGlvbkJyYW5kQWRkcmVzcyAmJiByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRyYW5zYWN0aW9uSXNPbmxpbmUgIT09IG51bGwpIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBkYXRhXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgc3RvcmUgZGV0YWlscyBjYWxsIWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscywgd2hpY2ggbWFpbmx5IGluY2x1ZGUgdGhlIHRpbWUgb2YgcHVyY2hhc2UsIGFzc29jaWF0ZWRcbiAqIHdpdGggdGhlIHRyYW5zYWN0aW9uIGV2ZW50LCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyB0aGUgdHJhbnNhY3Rpb24gaW4gdGhlIERCLlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIHRyYW5zYWN0aW9uIHRoZSB0cmFuc2FjdGlvbiBvYmplY3Qgb2J0YWluZWQgZnJvbSBPbGl2ZSB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBtZXNzYWdlLFxuICogd2hpY2ggYWRkaXRpb25hbCB0cmFuc2FjdGlvbiBkZXRhaWxzIG9idGFpbmVkIHRocm91Z2ggdGhpcyBjYWxsIGFyZSBhcHBlbmRlZCB0b1xuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uIGluZm9ybWF0aW9uIHBhc3NlZFxuICogaW4gdGhyb3VnaCB0aGUgU1FTIG1lc3NhZ2UsIGFsb25nc2lkZSB0aGUgYWRkaXRpb25hbCB0cmFuc2FjdGlvbiBkZXRhaWxzIHJldHJpZXZlZCB0aHJvdWdoIHRoaXMgY2FsbC5cbiAqL1xuY29uc3QgZ2V0VHJhbnNhY3Rpb25EZXRhaWxzID0gYXN5bmMgKG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uKTogUHJvbWlzZTxUcmFuc2FjdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IGFkZGl0aW9uYWwgdHJhbnNhY3Rpb24gZGV0YWlscyBmb3IgdGhlIGluY29taW5nIHRyYW5zYWN0aW9uXG4gICAgY29uc3QgcmVzcG9uc2U6IFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRUcmFuc2FjdGlvbkRldGFpbHModHJhbnNhY3Rpb24pO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLnRpbWVzdGFtcCAmJiByZXNwb25zZS5kYXRhLnRpbWVzdGFtcCAhPT0gMCkge1xuICAgICAgICAvLyByZXR1cm5zIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGRhdGFcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwhYDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==