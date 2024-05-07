import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    MoonbeamClient,
    PlaidLinkingSessionResponse,
    PlaidLinkingSessionStatus,
    PlaidWebhookCode,
    PlaidWebhookLinkInput,
    PlaidWebhookStatus,
    UpdatePlaidLinkingSessionResponse
} from "@moonbeam/moonbeam-models";

/**
 * PlaidLinkEventsProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the Plaid
 * Link message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processPlaidLink = async (event: SQSEvent): Promise<SQSBatchResponse> => {
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

        // for each record in the incoming event, repeat the Plaid Link event processing steps
        for (const plaidLinkingRecord of event.Records) {
            /**
             * The overall Plaid Linking processing, will be made up of the following steps:
             *
             * 0) Categorize the type of Linking update. For now, we can only process Link of types
             * SESSION_FINISHED.
             * 1) Call the getPlaidLinkingSessionByToken Moonbeam AppSync API Endpoint, to get the appropriate
             * information needed in order to make subsequent calls (such as user ID and timestamp).
             *
             * 2) If the Link SESSION_FINISHED was successful, then proceed with the next steps, otherwise
             * call the updatePlaidLinkingSession Moonbeam AppSync API endpoint, to mark the Linking Session
             * as failed/exited.
             *
             * first, convert the incoming event message body, into a PlaidWebhookLinkInput object
             */
            const plaidWebhookLinkInput: PlaidWebhookLinkInput = JSON.parse(plaidLinkingRecord.body) as PlaidWebhookLinkInput;

            /**
             * 0) Categorize the type of Linking update. For now, we can only process Link of types
             * SESSION_FINISHED.
             */
            switch (plaidWebhookLinkInput.webhook_code) {
                case PlaidWebhookCode.SessionFinished:
                    /**
                     * 1) Call the getPlaidLinkingSessionByToken Moonbeam AppSync API Endpoint, to get the appropriate
                     * information needed in order to make subsequent calls (such as user ID and timestamp).
                     *
                     * first, initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
                     */
                    const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

                    // make the getPlaidLinkingSessionByToken call
                    const plaidLinkingSessionResponse: PlaidLinkingSessionResponse = await moonbeamClient.getPlaidLinkingSessionByToken({
                        link_token: plaidWebhookLinkInput.link_token
                    });

                    // check if the getPlaidLinkingSessionByToken call was successful or not
                    if (plaidLinkingSessionResponse && !plaidLinkingSessionResponse.errorMessage && !plaidLinkingSessionResponse.errorType &&
                        plaidLinkingSessionResponse.data) {
                        /**
                         * 2) If the Link SESSION_FINISHED was successful, then proceed with the next steps, otherwise
                         * call the updatePlaidLinkingSession Moonbeam AppSync API endpoint, to mark the Linking Session
                         * as failed/exited.
                         */
                        if (plaidWebhookLinkInput.status.toLowerCase() === PlaidWebhookStatus.Success.toLowerCase()) {

                        } else {
                            /**
                             * Call the updatePlaidLinkingSession Moonbeam AppSync API endpoint, to mark the Linking Session
                             * as failed/exited.
                             */
                            const updatePlaidLinkingSessionResponse: UpdatePlaidLinkingSessionResponse = await moonbeamClient.updatePlaidLinkingSession({
                                id: plaidLinkingSessionResponse.data.id,
                                link_token: plaidLinkingSessionResponse.data.link_token,
                                public_token: "NOT_AVAILABLE",
                                session_id: "NOT_AVAILABLE",
                                status: plaidWebhookLinkInput.status.toLowerCase() === PlaidLinkingSessionStatus.Exit.toLowerCase()
                                    ? PlaidLinkingSessionStatus.Exit
                                    : PlaidLinkingSessionStatus.Error
                            });

                            // check if the updatePlaidLinkingSession call was successful or not
                            if (updatePlaidLinkingSessionResponse && !updatePlaidLinkingSessionResponse.errorMessage && !updatePlaidLinkingSessionResponse.errorType &&
                                updatePlaidLinkingSessionResponse.data) {
                                console.log(`Successfully marked the Link Session as either ${PlaidLinkingSessionStatus.Error} or ${PlaidLinkingSessionStatus.Exit}!`);
                            } else {
                                console.log(`Failed to update the Plaid Linking session!`);

                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: plaidLinkingRecord.messageId
                                });
                            }
                        }
                    } else {
                        console.log(`Failed to retrieve the Plaid Linking session by link_token`);

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: plaidLinkingRecord.messageId
                        });
                    }
                    break;
                default:
                    console.log(`Plaid Link webhook not able to processed for code ${plaidWebhookLinkInput.webhook_code}!`);

                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: plaidLinkingRecord.messageId
                    });
                    break;
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
        console.log(`Unexpected error while processing ${JSON.stringify(event)} Plaid Linking event ${error}`);

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
