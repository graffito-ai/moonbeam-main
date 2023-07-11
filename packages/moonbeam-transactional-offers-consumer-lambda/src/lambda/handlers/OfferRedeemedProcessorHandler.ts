import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {
    MemberDetailsResponse,
    MoonbeamClient,
    MoonbeamTransaction,
    MoonbeamTransactionResponse,
    OliveClient,
    Transaction,
    TransactionResponse,
    TransactionsErrorType
} from "@moonbeam/moonbeam-models";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";

/**
 * OfferRedeemedProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processOfferRedeemedTransactions = async (event: SQSEvent): Promise<SQSBatchResponse> => {
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
            const transaction: Transaction = JSON.parse(transactionalRecord.body) as Transaction;

            // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
            const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

            // 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
            const memberDetailsResponse: MemberDetailsResponse = await getMemberDetails(oliveClient, transaction.memberId);

            // check to see if the member details call was successful or not
            if (memberDetailsResponse && !memberDetailsResponse.errorMessage && !memberDetailsResponse.errorType && memberDetailsResponse.data) {
                // set the transaction id, to be the userID mapped to the extMemberId retrieved from the member details call
                transaction.id = memberDetailsResponse.data;

                // 2) Call the GET brand details Olive API to retrieve the brand name for incoming transaction
                const brandDetailsResponse: TransactionResponse = await getBrandDetails(oliveClient, transaction);

                // check to see if the brand details call was successful or not
                if (brandDetailsResponse && !brandDetailsResponse.errorMessage && !brandDetailsResponse.errorType && brandDetailsResponse.data) {
                    // 3) Call the GET store details Olive API to retrieve the brand store address for incoming transaction
                    const storeDetailsResponse: TransactionResponse = await getStoreDetails(oliveClient, transaction);

                    // check to see if the store details call was successful or not
                    if (storeDetailsResponse && !storeDetailsResponse.errorMessage && !storeDetailsResponse.errorType && storeDetailsResponse.data) {
                        // 4) Call the GET transaction details Olive API to retrieve the actual purchase date/time for an incoming transaction
                        const transactionDetailsResponse: TransactionResponse = await getTransactionDetails(oliveClient, transaction);

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
                            const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

                            // execute the createTransaction call
                            const response: MoonbeamTransactionResponse = await moonbeamClient.createTransaction(transaction as MoonbeamTransaction);

                            // check to see if the card linking call was executed successfully
                            if (!response || response.errorMessage || response.errorType || !response.data || !response.id) {
                                console.log(`Unexpected error and/or response structure returned from the createTransaction call ${JSON.stringify(response)}!`);

                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: transactionalRecord.messageId
                                });
                            }
                        } else {
                            console.log(`Transaction Details mapping through GET transaction details call failed`);

                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: transactionalRecord.messageId
                            });
                        }
                    } else {
                        console.log(`Store Details mapping through GET store details call failed`);

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: transactionalRecord.messageId
                        });
                    }
                } else {
                    console.log(`Brand Details mapping through GET brand details call failed`);

                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: transactionalRecord.messageId
                    });
                }
            } else {
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
        }
    } catch (error) {
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
 * of the brand that the transaction was executed at, to be used when storing the transaction in the DB.
 *
 * @param oliveClient client used to make Olive API calls
 * @param transaction the transaction object obtained from Olive through the transaction message,
 * which brand details obtained through this call are appended to
 *
 * @returns a {@link Promise} of {@link TransactionResponse} representing the transaction information passed
 * in through the SQS message, alongside the brand details retrieved through this call.
 */
const getBrandDetails = async (oliveClient: OliveClient, transaction: Transaction): Promise<TransactionResponse> => {
    // execute the brand details retrieval call, in order to get the brand details for the incoming transaction
    const response: TransactionResponse = await oliveClient.getBrandDetails(transaction);

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
const getStoreDetails = async (oliveClient: OliveClient, transaction: Transaction): Promise<TransactionResponse> => {
    // execute the brand details retrieval call, in order to get the store details for the incoming transaction
    const response: TransactionResponse = await oliveClient.getStoreDetails(transaction);

    // check to see if the store details call was executed successfully
    if (response && !response.errorMessage && !response.errorType && response.data &&
        response.data.transactionBrandAddress && response.data.transactionBrandAddress.length !== 0 &&
        response.data.transactionIsOnline !== null) {
        // returns the updated transaction data
        return {
            data: response.data
        }
    } else {
        const errorMessage = `Unexpected response structure returned from the store details call!`;
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
const getTransactionDetails = async (oliveClient: OliveClient, transaction: Transaction): Promise<TransactionResponse> => {
    // execute the transaction details retrieval call, in order to get additional transaction details for the incoming transaction
    const response: TransactionResponse = await oliveClient.getTransactionDetails(transaction);

    // check to see if the transaction details call was executed successfully
    if (response && !response.errorMessage && !response.errorType && response.data &&
        response.data.timestamp && response.data.timestamp !== 0) {
        // returns the updated transaction data
        return {
            data: response.data
        }
    } else {
        const errorMessage = `Unexpected response structure returned from the transaction details call!`;
        console.log(errorMessage);

        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        }
    }
}
