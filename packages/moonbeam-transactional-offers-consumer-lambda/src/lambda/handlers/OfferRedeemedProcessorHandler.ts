import {SQSBatchResponse, SQSEvent} from "aws-lambda";

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
        // const region = process.env.AWS_REGION!;

        // TODO:
        //      1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
        //      2) Call the GET brand details Olive API to retrieve the brand name for transaction
        //      3) Call the GET store details Olive API to retrieve the brand store address for transaction
        //      4) Call the createTransaction Moonbeam AppSync API endpoint, to store transaction in Dynamo DB database
        //      5) Convert any necessary timestamps and created/updated at times to appropriate formats
        //      6) Return the appropriate responses for happy and/or unhappy paths

        // // call the Olive Client API here, in order to call the appropriate endpoints for this handler
        // const oliveClient = new OliveClient(process.env.ENV_NAME!, region);
        //
        // // execute the member details retrieval call, in order to get the Moonbeam userId to be used in associating a transaction with a Moonbeam user
        // const response: MemberDetailsResponse = await oliveClient.getMemberDetails(requestData["memberId"]);
        //
        // // check to see if the member details call was executed successfully
        // if (response && !response.errorMessage && !response.errorType && response.data && response.data.length !== 0) {
        //     // build the transaction object from the incoming request body
        //     const transaction: Transaction = {
        //         id: response.data,
        //         memberId: requestData["memberId"],
        //         storeId: requestData["transaction"]["storeId"],
        //         brandId: requestData["transaction"]["brandId"],
        //         cardId: requestData["transaction"]["cardId"],
        //         category: requestData["transaction"]["merchantCategoryCode"],
        //         currencyCode: requestData["transaction"]["currencyCode"],
        //         transactionId: requestData["transaction"]["created"],
        //         // set the status of all incoming transactions to be pending, until we get a status change and/or until the cashback is reimbursed to the customer
        //         transactionStatus: TransactionsStatus.Pending,
        //         // the type of this transaction will be an offer redeemed type for now. In the future when we process different types of transactions, this might change
        //         transactionType: TransactionType.OfferRedeemed,
        //         /**
        //          * at creation time, these timestamps won't be converted appropriately, to what we expect them to look like. That conversion will be done all at
        //          * processing time, but it will all depend on the creation time of the transaction, which is why that is passed for all these values below
        //          */
        //         timestamp: 0,
        //         createdAt: requestData["transaction"]["created"],
        //         updatedAt: requestData["transaction"]["created"],
        //         rewardAmount: requestData["transaction"]["rewardAmount"],
        //         totalAmount: requestData["transaction"]["amount"],
        //         // we start with 0 dollars credited to the customer, since the whole reward amount is pending credit at transaction creation time
        //         creditedCashbackAmount: "0",
        //         pendingCashbackAmount: requestData["transaction"]["rewardAmount"]
        //     }
        //
        //     // initializing the SNS Client
        //     const snsClient = new SNSClient({region: region});
        //
        //     /**
        //      * drop the transaction as a message to the transactions processing topic
        //      *
        //      * note: in the future when we will have other types of transactions, other than offer based ones, we will need to add a filter
        //      * through the message attributes of the topic, so that only messages with specific filters get dropped to a particular processing
        //      * queue.
        //      */
        //     const transactionReceipt = await snsClient.send(new PublishCommand({
        //         TopicArn: process.env.TRANSACTIONS_PROCESSING_TOPIC_ARN!,
        //         Message: JSON.stringify(transaction),
        //         /**
        //          * the message group id, will be represented by the user id, so that we can group transaction messages for a particular user id,
        //          * and sort them in the FIFO processing topic accordingly
        //          */
        //         MessageGroupId: transaction.id
        //     }));
        //
        //     // ensure that the transaction message was properly sent to the appropriate processing topic
        //     if (transactionReceipt && transactionReceipt.MessageId && transactionReceipt.MessageId.length !== 0 &&
        //         transactionReceipt.SequenceNumber && transactionReceipt.SequenceNumber.length !== 0) {
        //         /**
        //          * the transaction has been successfully dropped into the topic, and will be picked up by the transactions consumer and other
        //          * services, like the notifications service consumer.
        //          */
        //         console.log(`Transaction successfully sent to topic for processing with receipt information: ${transactionReceipt.MessageId} ${transactionReceipt.SequenceNumber}`);
        //
        //         return {
        //             statusCode: 202,
        //             body: JSON.stringify({
        //                 data: `Transaction acknowledged!`
        //             })
        //         }
        //     } else {
        //         const errorMessage = `Unexpected error while sending the transaction message further!`;
        //         console.log(errorMessage);
        //
        //         /**
        //          * if there are errors associated with sending the message to the topic.
        //          * Olive will retry sending this message upon receiving of a non 2XX code
        //          */
        //         return {
        //             statusCode: 424,
        //             body: JSON.stringify({
        //                 data: null,
        //                 errorType: TransactionsErrorType.Unprocessable,
        //                 errorMessage: errorMessage
        //             })
        //         }
        //     }
        // } else {
        //     const errorMessage = `Unexpected response structure returned from the member details call!`;
        //     console.log(errorMessage);
        //
        //     /**
        //      * if there are errors associated with the call, just return the error message and error type from the upstream client
        //      * Olive will retry sending this message upon receiving of a non 2XX code
        //      */
        //     return {
        //         statusCode: 400,
        //         body: JSON.stringify({
        //             data: null,
        //             errorType: TransactionsErrorType.ValidationError,
        //             errorMessage: errorMessage
        //         })
        //     }
        // }


        /**
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array here.
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: []
        }
    } catch (error) {
        const errorMessage = `Unexpected error while processing ${JSON.stringify(event)} transactional event`;
        console.log(`${errorMessage} ${error}`);

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
