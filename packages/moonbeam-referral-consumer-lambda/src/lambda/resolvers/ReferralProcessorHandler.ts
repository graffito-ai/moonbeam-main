import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    EligibleLinkedUsersResponse,
    MarketingCampaignCode,
    MoonbeamClient,
    Referral,
    ReferralResponse,
    ReferralStatus
} from "@moonbeam/moonbeam-models";

/**
 * ReferralProcessor handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the referral information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processReferral = async (event: SQSEvent): Promise<SQSBatchResponse> => {
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

        /**
         * The overall referral processing, will be made up of the following steps:
         *
         * 1) Call the getEligibleLinkedUsers Moonbeam AppSync API endpoint, to retrieve all users who have a linked card
         * associated with their account (call this only once).
         *
         * For Referrals with campaign codes of type "RAFFLEREGDEC23" or "RAFFLEREGDEC24", do the following:
         *
         * 2) Determine whether the toId from the incoming referral needed processing is associated with a user who has
         * a linked card to their account.
         * 3) For each eligible user from the previous step, call the updateReferral Moonbeam AppSync API endpoint, in order
         * to update the referral object's status to VALID
         *
         *
         * first, before starting, initialize the Moonbeam Client API here, in order to call the appropriate endpoints
         * for this handler.
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

        // 1) Call the getEligibleLinkedUsers Moonbeam AppSync API endpoint
        const linkedUsersResponse: EligibleLinkedUsersResponse = await moonbeamClient.getEligibleLinkedUsers();

        // check to see if the get eligible linked user call was successful or not.
        if (linkedUsersResponse !== null && linkedUsersResponse !== undefined && !linkedUsersResponse.errorMessage
            && !linkedUsersResponse.errorType && linkedUsersResponse.data && linkedUsersResponse.data.length !== 0) {
            // for each referral object repeat steps 2 and 3 from above, depending on the campaign code
            for (const referralRecord of event.Records) {
                // first, convert the incoming event message body, into a referral object
                const referral: Referral = JSON.parse(referralRecord.body) as Referral;

                switch (referral.campaignCode) {
                    case MarketingCampaignCode.Raffleregdec23:
                    case MarketingCampaignCode.Raffleregjan24:
                        // flag specifying whether the referred user from the referral matches a user with linked card
                        let userMatched: boolean = false;

                        /**
                         * 2) Determine whether the toId from the incoming referral needed processing is associated with a user who has
                         * a linked card to their account.
                         */
                        linkedUsersResponse.data.forEach(linkedUser => {
                            if (linkedUser !== null && referral.toId === linkedUser.id) {
                                userMatched = true
                            }
                        });
                        if (!userMatched) {
                            console.log(`User ${referral.toId} from referral not matched with any linked users`);

                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: referralRecord.messageId
                            });
                        } else {
                            /**
                             * 3) For each eligible user from the previous step, call the updateReferral Moonbeam AppSync API endpoint, in order
                             * to update the referral object's status to VALID
                             */
                            const updatedReferralResponse: ReferralResponse = await moonbeamClient.updateReferral({
                                fromId: referral.fromId,
                                status: ReferralStatus.Valid,
                                timestamp: referral.timestamp
                            });

                            // check to see if the update referral user call was successful or not.
                            if (updatedReferralResponse !== null && updatedReferralResponse !== undefined && !updatedReferralResponse.errorType
                                && !updatedReferralResponse.errorMessage && updatedReferralResponse.data && updatedReferralResponse.data.length !== 0) {
                                const updatedReferral: Referral = updatedReferralResponse.data[0]!;

                                // make sure that the returned status is Valid for the updated referral
                                if (updatedReferral.status === ReferralStatus.Valid) {
                                    console.log(`Successfully processed referral fromId ${referral.fromId} and timestamp ${referral.timestamp}`);
                                } else {
                                    console.log(`Updated referral status is not Valid - ${updatedReferral.status}`);

                                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                    itemFailures.push({
                                        itemIdentifier: event.Records[0].messageId
                                    });
                                }
                            } else {
                                console.log(`Update referral through updateReferral API call failed`);

                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: event.Records[0].messageId
                                });
                            }
                        }
                        break;
                    default:
                        console.log(`Unsupported campaign code  for referral attempted to be processed ${referral.campaignCode}`);

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: event.Records[0].messageId
                        });
                        break;
                }
            }
        } else {
            console.log(`Linked users retrieval through GET linked users call failed`);

            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
            itemFailures.push({
                itemIdentifier: event.Records[0].messageId
            });
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
        console.log(`Unexpected error while processing ${JSON.stringify(event)} referral event ${error}`);

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
