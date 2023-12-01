import {MoonbeamClient, Referral, ReferralResponse, ReferralStatus} from "@moonbeam/moonbeam-models";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

/**
 * Function used to handle the daily referral trigger, by first
 * determining whether there are any referrals that need to be processed, and by
 * kick-starting that process for any applicable users, accordingly.
 */
export const triggerReferral = async (): Promise<void> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * The overall referral cron triggering, will be made up of the following steps:
         *
         * 1) Call the getReferralsByStatus AppSync Query API in order to:
         * get any PENDING Referrals.
         *
         * 2) For any Referrals that are PENDING, drop them into the referrals processing
         * SNS topic.
         *
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

        // 1) Call the getReferralsByStatus Moonbeam AppSync Query API endpoint.
        const referralResponse: ReferralResponse = await moonbeamClient.getReferralByStatus({
            status: ReferralStatus.Pending
        });

        // check to see if the get referrals by status call was successful or not.
        if (referralResponse !== null && referralResponse !== undefined && !referralResponse.errorMessage &&
            !referralResponse.errorType && referralResponse.data !== null && referralResponse.data !== undefined &&
            referralResponse.data.length !== 0) {

            let processedReferralsCount = 0;
            // filter through each PENDING referral
            for (const referral of referralResponse.data) {
                // initializing the SNS Client
                const snsClient = new SNSClient({region: region});

                // for any PENDING referrals, drop them into the referrals processing SNS topic for them to be processed accordingly
                const referralReceipt = await snsClient.send(new PublishCommand({
                    TopicArn: process.env.REFERRAL_PROCESSING_TOPIC_ARN!,
                    Message: JSON.stringify(referral as Referral),
                    /**
                     * the message group id, will be represented by the fromId, so that we can group the referral messages for a particular
                     * user id, and sort them in the FIFO processing topic accordingly.
                     */
                    MessageGroupId: (referral as Referral)!.fromId
                }));

                // ensure that the referral message was properly sent to the appropriate processing topic
                if (referralReceipt !== null && referralReceipt !== undefined && referralReceipt.MessageId &&
                    referralReceipt.MessageId.length !== 0 && referralReceipt.SequenceNumber && referralReceipt.SequenceNumber.length !== 0) {
                    // the referral  message has been successfully dropped into the topic, and will be picked up by the referral consumer
                    console.log(`Referral successfully sent to topic for processing with receipt information: ${referralReceipt.MessageId} ${referralReceipt.SequenceNumber}`);
                    // increase the number of messages sent to the topic (representing the number of referrals sent to the topic)
                    processedReferralsCount += 1;
                } else {
                    /**
                     * no need for further actions, since this error will be logged and nothing will execute further.
                     * in the future we might need some alerts and metrics emitting here
                     */
                    console.log(`Unexpected error while sending referral from user ${(referral as Referral)!.fromId} to user ${(referral as Referral)!.toId} at ${(referral as Referral)!.timestamp}`);
                }
            }

            // if the number of successfully processed referrals does not match the number of available referrals to process
            if (processedReferralsCount !== referralResponse.data.length) {
                console.log(`__________________________________________________________________________________________________________________________________`);
                console.log(`Was not able to successfully send all PENDING referrals. Sent ${processedReferralsCount} referrals out of ${referralResponse.data.length}`);
            } else {
                console.log(`__________________________________________________________________________________________________________________________________`);
                console.log(`Ran trigger for Referrals at ${new Date(Date.now()).toISOString()}, and found ${processedReferralsCount} PENDING referrals`);
            }
        } else {
            /**
             * no need for further actions, since this error will be logged and nothing will execute further.
             * in the future we might need some alerts and metrics emitting here
             */
            console.log(`Referrals retrieval through GET referrals by status call failed`);
        }
    } catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the referral cron event ${error}`);
    }
}
