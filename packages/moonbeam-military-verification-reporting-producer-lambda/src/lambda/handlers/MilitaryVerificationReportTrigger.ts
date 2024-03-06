import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import {MilitaryVerificationReportingInformationResponse, MoonbeamClient} from "@moonbeam/moonbeam-models";

/**
 * Function used to handle the military verification reporting trigger, by first
 * determining which users have signed up during a particular period of time, and then
 * kick-starting the reporting process for them.
 *
 * @returns a {@link Promise} of {@link void}, since the EventBridger
 * event trigger, will execute a cron job and not return anything.
 */
export const triggerMilitaryVerificationReport = async (): Promise<void> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * The overall military verification reporting cron triggering, will be made up of the following steps:
         *
         * 1) Call the getMilitaryVerificationInformation AppSync Query API in order to:
         *    - get all VERIFIED users who signed-up in the past 3 hours
         *    - get all PENDING users who signed-up in the past 3 hours
         *    - get all REJECTED users who signed-up in the past 3 hours
         *
         * 2) For all applicable users who signed-up in the past 3 hours, drop a message into the appropriate SNS topic,
         * containing all of their information to process.
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

        // get the current date and time, and based on that, put together the appropriate start and end dates to be passed below
        const startDate = new Date();
        const endDate = new Date();

        // set the current hour 00 min, 00 seconds, 000 milliseconds as the end date
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);

        // set 3 hours before that, 00 min, 00 seconds, 001 milliseconds as the start date
        startDate.setHours(endDate.getHours() - 3);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(1);

        console.log(`Observing new signed-up users between ${startDate.toISOString()} and ${endDate.toISOString()}`);

        // 1) Call the getMilitaryVerificationInformation Moonbeam AppSync Query API endpoint.
        const militaryVerificationInformation: MilitaryVerificationReportingInformationResponse = await moonbeamClient.getMilitaryVerificationInformation({
            startDate: startDate.toISOString(), // inclusive
            endDate: endDate.toISOString() // inclusive
        });

        // check to see if the get military verification information call was successful or not.
        if (militaryVerificationInformation !== null && militaryVerificationInformation !== undefined && !militaryVerificationInformation.errorMessage &&
            !militaryVerificationInformation.errorType && militaryVerificationInformation.data !== null && militaryVerificationInformation.data !== undefined &&
            militaryVerificationInformation.data.length !== 0) {

            // initializing the SNS Client
            const snsClient = new SNSClient({region: region});

            /**
             * drop the new signed-up users in a message to the military verification reporting processing topic
             */
            const militaryVerificationReportingReceipt = await snsClient.send(new PublishCommand({
                TopicArn: process.env.MILITARY_VERIFICATION_REPORTING_PROCESSING_TOPIC_ARN!,
                Message: JSON.stringify(militaryVerificationInformation.data),
                /**
                 * the message group id, will be represented by the start and end date combination, so that we can group the military verification reporting reminder update messages
                 * for a particular timeframe, and sort them in the FIFO processing topic accordingly.
                 */
                MessageGroupId: `${startDate.toISOString()}-${endDate.toISOString()}`
            }));

            // ensure that the military verification reporting message was properly sent to the appropriate processing topic
            if (militaryVerificationReportingReceipt !== null && militaryVerificationReportingReceipt !== undefined && militaryVerificationReportingReceipt.MessageId &&
                militaryVerificationReportingReceipt.MessageId.length !== 0 && militaryVerificationReportingReceipt.SequenceNumber && militaryVerificationReportingReceipt.SequenceNumber.length !== 0) {
                // the military verification reporting reminder message has been successfully dropped into the topic, and will be picked up by the military verification reminder consumer
                console.log(`Military verification reporting reminder successfully sent to topic for processing with receipt information: ${militaryVerificationReportingReceipt.MessageId} ${militaryVerificationReportingReceipt.SequenceNumber}`);
            } else {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                console.log(`Unexpected error while sending the military verification reporting reminder for timeframe ${startDate.toISOString()}-${endDate.toISOString()}`);
            }
        } else {
            // if there are no new users, then log that appropriately since it is not an error
            if (militaryVerificationInformation.data !== null && militaryVerificationInformation.data !== undefined &&
                militaryVerificationInformation.data.length === 0) {
                console.log(`No new users signed-up between ${startDate.toISOString()} and ${endDate.toISOString()}`)
            } else {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                console.log(`New registered users retrieval through GET military verification information call failed`);
            }
        }
    } catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the military verification reporting cron event ${error}`);
    }
}
