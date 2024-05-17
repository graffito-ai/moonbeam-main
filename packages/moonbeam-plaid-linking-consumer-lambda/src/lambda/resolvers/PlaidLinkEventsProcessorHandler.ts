import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    BankingItemResponse,
    InstitutionResponse,
    MoonbeamClient, PlaidAuthResponse, PlaidClient,
    PlaidLinkingSessionResponse,
    PlaidLinkingSessionStatus,
    PlaidWebhookCode,
    PlaidWebhookLinkInput,
    PlaidWebhookStatus, TokenExchangeResponse,
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
             * 2) If the Link SESSION_FINISHED was successful, then proceed with the next steps, otherwise
             * call the updatePlaidLinkingSession Moonbeam AppSync API endpoint, to mark the Linking Session
             * as failed/exited.
             * 3) Call the Plaid public token exchange (/item/public_token/exchange) API endpoint, in order to get an access
             * token for the public token received from the SESSION_FINISHED webhook update above.
             * 4) Call the Plaid (/auth/get) API endpoint, in order to get specific information about the Linked Item,
             * such as Account and Routing numbers, as well as the name of the account and balance.
             * 5) Call the Plaid (/institutions/get_by_id) API endpoint, in order to get specific information about the
             * Institution that the Plaid Linked Item belongs (aka - the name of the institution).
             * 6) Call the createPlaidLinkItem Moonbeam AppSync API Endpoint, to store the appropriate institution with the
             * appropriate account.
             * 7) Call the updatePlaidLinkingSession Moonbeam AppSync API endpoint, to mark the Linking Session
             * as either failed/successful, depending on whether Steps 3-6 were successful or not.
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
                    // First ensure that we have all the appropriate information coming from the webhook input
                    if (plaidWebhookLinkInput.public_token && plaidWebhookLinkInput.link_token) {
                        /**
                         * 1) Call the getPlaidLinkingSessionByToken Moonbeam AppSync API Endpoint, to get the appropriate
                         * information needed in order to make subsequent calls (such as user ID and timestamp).
                         *
                         * first, initialize the Moonbeam API Client here, in order to call the appropriate endpoints for this handler
                         */
                        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

                        // make the getPlaidLinkingSessionByToken call
                        const plaidLinkingSessionResponse: PlaidLinkingSessionResponse = await moonbeamClient.getPlaidLinkingSessionByToken({
                            link_token: plaidWebhookLinkInput.link_token
                        });

                        // check if the getPlaidLinkingSessionByToken call was successful or not
                        if (plaidLinkingSessionResponse && !plaidLinkingSessionResponse.errorMessage && !plaidLinkingSessionResponse.errorType &&
                            plaidLinkingSessionResponse.data && plaidLinkingSessionResponse.data.id && plaidLinkingSessionResponse.data.link_token === plaidWebhookLinkInput.link_token) {
                            /**
                             * 2) If the Link SESSION_FINISHED was successful, then proceed with the next steps, otherwise
                             * call the updatePlaidLinkingSession Moonbeam AppSync API endpoint, to mark the Linking Session
                             * as failed/exited.
                             */
                            if (plaidWebhookLinkInput.status.toLowerCase() === PlaidWebhookStatus.Success.toLowerCase()) {
                                // flag use to mark whether a linking session and Item were successful or not
                                let wasLinkingSuccessful: boolean = false;

                                // initialize the Plaid API Client here, in order to call the appropriate endpoints for this handler
                                const plaidClient = new PlaidClient(process.env.ENV_NAME!, region);

                                /**
                                 * 3) Call the Plaid public token exchange (/item/public_token/exchange) API endpoint, in order to get an access
                                 * token for the public token received from the SESSION_FINISHED webhook update above.
                                 */
                                const tokenExchangeResponse: TokenExchangeResponse = await plaidClient.exchangePlaidToken(plaidWebhookLinkInput.public_token);

                                // check if the exchangePlaidToken call was successful or not
                                if (tokenExchangeResponse && !tokenExchangeResponse.errorMessage && !tokenExchangeResponse.errorType &&
                                    tokenExchangeResponse.data && tokenExchangeResponse.data.access_token) {
                                    /**
                                     * 4) Call the Plaid (/auth/get) API endpoint, in order to get specific information about the Linked Item,
                                     * such as Account and Routing numbers, as well as the name of the account and balance.
                                     */
                                    const plaidAuthResponse: PlaidAuthResponse = await plaidClient.getPlaidAuth(tokenExchangeResponse.data.access_token);

                                    // check if the getPlaidAuth call was successful or not
                                    if (plaidAuthResponse && !plaidAuthResponse.errorMessage && !plaidAuthResponse.errorType &&
                                        plaidAuthResponse.data && plaidAuthResponse.data.institution_id && plaidAuthResponse.data.account &&
                                        plaidAuthResponse.data.account.length === 1) {
                                        /**
                                         * 5) Call the Plaid (/institutions/get_by_id) API endpoint, in order to get specific information about the
                                         * Institution that the Plaid Linked Item belongs (aka - the name of the institution).
                                         */
                                        const institutionResponse: InstitutionResponse = await plaidClient.getInstitutionById(plaidAuthResponse.data.institution_id);

                                        // check if the getInstitutionById call was successful or not
                                        if (institutionResponse && !institutionResponse.errorMessage && !institutionResponse.errorType && institutionResponse.data) {
                                            /**
                                             * 6) Call the createPlaidLinkItem Moonbeam AppSync API Endpoint, to store the appropriate institution with the
                                             * appropriate account.
                                             */
                                            const bankingItemResponse: BankingItemResponse = await moonbeamClient.createBankingItem({
                                                accessToken: tokenExchangeResponse.data.access_token,
                                                accounts: [{
                                                    accountId: plaidAuthResponse.data.account[0].account_id,
                                                    accountMask: plaidAuthResponse.data.account[0].mask,
                                                    accountName: plaidAuthResponse.data.account[0].name,
                                                    accountNumber: plaidAuthResponse.data.account[0].account,
                                                    accountOfficialName: plaidAuthResponse.data.account[0].official_name,
                                                    persistentAccountId: plaidAuthResponse.data.account[0].persistent_account_id,
                                                    routingNumber: plaidAuthResponse.data.account[0].routing,
                                                    subType: plaidAuthResponse.data.account[0].subtype,
                                                    type: plaidAuthResponse.data.account[0].type,
                                                    wireRoutingNumber: plaidAuthResponse.data.account[0].wire_routing
                                                }],
                                                id: plaidLinkingSessionResponse.data.id,
                                                institutionId: plaidAuthResponse.data.institution_id,
                                                itemId: plaidAuthResponse.data.item_id,
                                                linkToken: plaidLinkingSessionResponse.data.link_token,
                                                name: institutionResponse.data.name,
                                                publicToken: plaidWebhookLinkInput.public_token
                                            });

                                            // check if the getInstitutionById call was successful or not
                                            if (bankingItemResponse && !bankingItemResponse.errorMessage && !bankingItemResponse.errorType && bankingItemResponse.data) {
                                                /**
                                                 * at this point we've successfully created the Banking Item to correspond to the Linking Session,
                                                 * so we just mark the linking flag as true accordingly
                                                 */
                                                wasLinkingSuccessful = true;
                                            } else {
                                                console.log(`Failed to create a corresponding Banking Item for Plaid Linking Session ${plaidLinkingSessionResponse.data.link_token}!`);

                                                // mark the linking session flag as unsuccessful
                                                wasLinkingSuccessful = false;
                                            }
                                        } else {
                                            console.log(`Failed to retrieve the Institution information by id!`);

                                            // mark the linking session flag as unsuccessful
                                            wasLinkingSuccessful = false;
                                        }
                                    } else {
                                        console.log(`Failed to retrieve the Linked Item Auth information!`);

                                        // mark the linking session flag as unsuccessful
                                        wasLinkingSuccessful = false;
                                    }
                                } else {
                                    console.log(`Failed to exchange the public token, for an access token!`);

                                    // mark the linking session flag as unsuccessful
                                    wasLinkingSuccessful = false;
                                }

                                /**
                                 * 7) Call the updatePlaidLinkingSession Moonbeam AppSync API endpoint, to mark the Linking Session
                                 * as either failed/successful, depending on whether Steps 3-6 were successful or not.
                                 */
                                const updatePlaidLinkingSessionResponse: UpdatePlaidLinkingSessionResponse = await moonbeamClient.updatePlaidLinkingSession({
                                    id: plaidLinkingSessionResponse.data.id,
                                    link_token: plaidLinkingSessionResponse.data.link_token,
                                    public_token: wasLinkingSuccessful
                                        ? plaidWebhookLinkInput.public_token
                                        : "NOT_AVAILABLE",
                                    session_id: plaidWebhookLinkInput.link_session_id,
                                    status: wasLinkingSuccessful
                                        ? PlaidLinkingSessionStatus.Success
                                        : PlaidLinkingSessionStatus.Error
                                });

                                // check if the updatePlaidLinkingSession call was successful or not
                                if (updatePlaidLinkingSessionResponse && !updatePlaidLinkingSessionResponse.errorMessage && !updatePlaidLinkingSessionResponse.errorType &&
                                    updatePlaidLinkingSessionResponse.data) {
                                    console.log(`Successfully marked the Link Session as ${wasLinkingSuccessful
                                        ? PlaidLinkingSessionStatus.Success
                                        : PlaidLinkingSessionStatus.Error}!`);
                                } else {
                                    console.log(`Failed to update the Plaid Linking session!`);

                                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                    itemFailures.push({
                                        itemIdentifier: plaidLinkingRecord.messageId
                                    });
                                }
                            } else {
                                /**
                                 * Call the updatePlaidLinkingSession Moonbeam AppSync API endpoint, to mark the Linking Session
                                 * as failed/exited.
                                 */
                                const updatePlaidLinkingSessionResponse: UpdatePlaidLinkingSessionResponse = await moonbeamClient.updatePlaidLinkingSession({
                                    id: plaidLinkingSessionResponse.data.id,
                                    link_token: plaidLinkingSessionResponse.data.link_token,
                                    public_token: "NOT_AVAILABLE",
                                    session_id: plaidWebhookLinkInput.link_session_id,
                                    status: plaidWebhookLinkInput.status.toLowerCase() === PlaidLinkingSessionStatus.Exited.toLowerCase()
                                        ? PlaidLinkingSessionStatus.Exited
                                        : PlaidLinkingSessionStatus.Error
                                });

                                // check if the updatePlaidLinkingSession call was successful or not
                                if (updatePlaidLinkingSessionResponse && !updatePlaidLinkingSessionResponse.errorMessage && !updatePlaidLinkingSessionResponse.errorType &&
                                    updatePlaidLinkingSessionResponse.data) {
                                    console.log(`Successfully marked the Link Session as either ${PlaidLinkingSessionStatus.Error} or ${PlaidLinkingSessionStatus.Exited}!`);
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
                    } else {
                        console.log(`Invalid information passed in from Plaid through the Webhook Input!`);

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
