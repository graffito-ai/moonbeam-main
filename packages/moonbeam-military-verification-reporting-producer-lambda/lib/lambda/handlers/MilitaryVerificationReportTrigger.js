"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerMilitaryVerificationReport = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * Function used to handle the military verification reporting trigger, by first
 * determining which users have signed up during a particular period of time, and then
 * kick-starting the reporting process for them.
 */
const triggerMilitaryVerificationReport = async () => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
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
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
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
        const militaryVerificationInformation = await moonbeamClient.getMilitaryVerificationInformation({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString() // inclusive
        });
        // check to see if the get military verification information call was successful or not.
        if (militaryVerificationInformation !== null && militaryVerificationInformation !== undefined && !militaryVerificationInformation.errorMessage &&
            !militaryVerificationInformation.errorType && militaryVerificationInformation.data !== null && militaryVerificationInformation.data !== undefined &&
            militaryVerificationInformation.data.length !== 0) {
            // initializing the SNS Client
            const snsClient = new client_sns_1.SNSClient({ region: region });
            /**
             * drop the new signed-up users in a message to the military verification reporting processing topic
             */
            const militaryVerificationReportingReceipt = await snsClient.send(new client_sns_1.PublishCommand({
                TopicArn: process.env.MILITARY_VERIFICATION_REPORTING_PROCESSING_TOPIC_ARN,
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
            }
            else {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                console.log(`Unexpected error while sending the military verification reporting reminder for timeframe ${startDate.toISOString()}-${endDate.toISOString()}`);
            }
        }
        else {
            // if there are no new users, then log that appropriately since it is not an error
            if (militaryVerificationInformation.data !== null && militaryVerificationInformation.data !== undefined &&
                militaryVerificationInformation.data.length === 0) {
                console.log(`No new users signed-up between ${startDate.toISOString()} and ${endDate.toISOString()}`);
            }
            else {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                console.log(`New registered users retrieval through GET military verification information call failed`);
            }
        }
    }
    catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the military verification reporting cron event ${error}`);
    }
};
exports.triggerMilitaryVerificationReport = triggerMilitaryVerificationReport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRUcmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9NaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQThEO0FBQzlELCtEQUEyRztBQUUzRzs7OztHQUlHO0FBQ0ksTUFBTSxpQ0FBaUMsR0FBRyxLQUFLLElBQW1CLEVBQUU7SUFDdkUsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7OztXQVVHO1FBQ0gsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXpFLHdIQUF3SDtRQUN4SCxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFFM0IsNEVBQTRFO1FBQzVFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNCLGtGQUFrRjtRQUNsRixTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3QixPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxTQUFTLENBQUMsV0FBVyxFQUFFLFFBQVEsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU3RyxzRkFBc0Y7UUFDdEYsTUFBTSwrQkFBK0IsR0FBcUQsTUFBTSxjQUFjLENBQUMsa0NBQWtDLENBQUM7WUFDOUksU0FBUyxFQUFFLFNBQVMsQ0FBQyxXQUFXLEVBQUU7WUFDbEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxZQUFZO1NBQzlDLENBQUMsQ0FBQztRQUVILHdGQUF3RjtRQUN4RixJQUFJLCtCQUErQixLQUFLLElBQUksSUFBSSwrQkFBK0IsS0FBSyxTQUFTLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxZQUFZO1lBQzFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxJQUFJLCtCQUErQixDQUFDLElBQUksS0FBSyxJQUFJLElBQUksK0JBQStCLENBQUMsSUFBSSxLQUFLLFNBQVM7WUFDakosK0JBQStCLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFFbkQsOEJBQThCO1lBQzlCLE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1lBRWxEOztlQUVHO1lBQ0gsTUFBTSxvQ0FBb0MsR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBYyxDQUFDO2dCQUNqRixRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvREFBcUQ7Z0JBQzNFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQztnQkFDN0Q7OzttQkFHRztnQkFDSCxjQUFjLEVBQUUsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFO2FBQ3hFLENBQUMsQ0FBQyxDQUFDO1lBRUosZ0hBQWdIO1lBQ2hILElBQUksb0NBQW9DLEtBQUssSUFBSSxJQUFJLG9DQUFvQyxLQUFLLFNBQVMsSUFBSSxvQ0FBb0MsQ0FBQyxTQUFTO2dCQUNySixvQ0FBb0MsQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxvQ0FBb0MsQ0FBQyxjQUFjLElBQUksb0NBQW9DLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hMLDBLQUEwSztnQkFDMUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxnSEFBZ0gsb0NBQW9DLENBQUMsU0FBUyxJQUFJLG9DQUFvQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7YUFDeE87aUJBQU07Z0JBQ0g7OzttQkFHRztnQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDZGQUE2RixTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNoSztTQUNKO2FBQU07WUFDSCxrRkFBa0Y7WUFDbEYsSUFBSSwrQkFBK0IsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLCtCQUErQixDQUFDLElBQUksS0FBSyxTQUFTO2dCQUNuRywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsU0FBUyxDQUFDLFdBQVcsRUFBRSxRQUFRLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUE7YUFDeEc7aUJBQU07Z0JBQ0g7OzttQkFHRztnQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDBGQUEwRixDQUFDLENBQUM7YUFDM0c7U0FDSjtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWjs7O1dBR0c7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLG9GQUFvRixLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQzVHO0FBQ0wsQ0FBQyxDQUFBO0FBOUZZLFFBQUEsaUNBQWlDLHFDQThGN0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1B1Ymxpc2hDb21tYW5kLCBTTlNDbGllbnR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtc25zXCI7XG5pbXBvcnQge01pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nSW5mb3JtYXRpb25SZXNwb25zZSwgTW9vbmJlYW1DbGllbnR9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBoYW5kbGUgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZXBvcnRpbmcgdHJpZ2dlciwgYnkgZmlyc3RcbiAqIGRldGVybWluaW5nIHdoaWNoIHVzZXJzIGhhdmUgc2lnbmVkIHVwIGR1cmluZyBhIHBhcnRpY3VsYXIgcGVyaW9kIG9mIHRpbWUsIGFuZCB0aGVuXG4gKiBraWNrLXN0YXJ0aW5nIHRoZSByZXBvcnRpbmcgcHJvY2VzcyBmb3IgdGhlbS5cbiAqL1xuZXhwb3J0IGNvbnN0IHRyaWdnZXJNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG92ZXJhbGwgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHJlcG9ydGluZyBjcm9uIHRyaWdnZXJpbmcsIHdpbGwgYmUgbWFkZSB1cCBvZiB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAxKSBDYWxsIHRoZSBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uIEFwcFN5bmMgUXVlcnkgQVBJIGluIG9yZGVyIHRvOlxuICAgICAgICAgKiAgICAtIGdldCBhbGwgVkVSSUZJRUQgdXNlcnMgd2hvIHNpZ25lZC11cCBpbiB0aGUgcGFzdCAzIGhvdXJzXG4gICAgICAgICAqICAgIC0gZ2V0IGFsbCBQRU5ESU5HIHVzZXJzIHdobyBzaWduZWQtdXAgaW4gdGhlIHBhc3QgMyBob3Vyc1xuICAgICAgICAgKiAgICAtIGdldCBhbGwgUkVKRUNURUQgdXNlcnMgd2hvIHNpZ25lZC11cCBpbiB0aGUgcGFzdCAzIGhvdXJzXG4gICAgICAgICAqXG4gICAgICAgICAqIDIpIEZvciBhbGwgYXBwbGljYWJsZSB1c2VycyB3aG8gc2lnbmVkLXVwIGluIHRoZSBwYXN0IDMgaG91cnMsIGRyb3AgYSBtZXNzYWdlIGludG8gdGhlIGFwcHJvcHJpYXRlIFNOUyB0b3BpYyxcbiAgICAgICAgICogY29udGFpbmluZyBhbGwgb2YgdGhlaXIgaW5mb3JtYXRpb24gdG8gcHJvY2Vzcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAvLyBnZXQgdGhlIGN1cnJlbnQgZGF0ZSBhbmQgdGltZSwgYW5kIGJhc2VkIG9uIHRoYXQsIHB1dCB0b2dldGhlciB0aGUgYXBwcm9wcmlhdGUgc3RhcnQgYW5kIGVuZCBkYXRlcyB0byBiZSBwYXNzZWQgYmVsb3dcbiAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgZW5kRGF0ZSA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IGhvdXIgMDAgbWluLCAwMCBzZWNvbmRzLCAwMDAgbWlsbGlzZWNvbmRzIGFzIHRoZSBlbmQgZGF0ZVxuICAgICAgICBlbmREYXRlLnNldE1pbnV0ZXMoMCk7XG4gICAgICAgIGVuZERhdGUuc2V0U2Vjb25kcygwKTtcbiAgICAgICAgZW5kRGF0ZS5zZXRNaWxsaXNlY29uZHMoMCk7XG5cbiAgICAgICAgLy8gc2V0IDMgaG91cnMgYmVmb3JlIHRoYXQsIDAwIG1pbiwgMDAgc2Vjb25kcywgMDAxIG1pbGxpc2Vjb25kcyBhcyB0aGUgc3RhcnQgZGF0ZVxuICAgICAgICBzdGFydERhdGUuc2V0SG91cnMoZW5kRGF0ZS5nZXRIb3VycygpIC0gMyk7XG4gICAgICAgIHN0YXJ0RGF0ZS5zZXRNaW51dGVzKDApO1xuICAgICAgICBzdGFydERhdGUuc2V0U2Vjb25kcygwKTtcbiAgICAgICAgc3RhcnREYXRlLnNldE1pbGxpc2Vjb25kcygxKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgT2JzZXJ2aW5nIG5ldyBzaWduZWQtdXAgdXNlcnMgYmV0d2VlbiAke3N0YXJ0RGF0ZS50b0lTT1N0cmluZygpfSBhbmQgJHtlbmREYXRlLnRvSVNPU3RyaW5nKCl9YCk7XG5cbiAgICAgICAgLy8gMSkgQ2FsbCB0aGUgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiBNb29uYmVhbSBBcHBTeW5jIFF1ZXJ5IEFQSSBlbmRwb2ludC5cbiAgICAgICAgY29uc3QgbWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbjogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvblJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbih7XG4gICAgICAgICAgICBzdGFydERhdGU6IHN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLCAvLyBpbmNsdXNpdmVcbiAgICAgICAgICAgIGVuZERhdGU6IGVuZERhdGUudG9JU09TdHJpbmcoKSAvLyBpbmNsdXNpdmVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgICAgICBpZiAobWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiAhPT0gbnVsbCAmJiBtaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uICE9PSB1bmRlZmluZWQgJiYgIW1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZXJyb3JNZXNzYWdlICYmXG4gICAgICAgICAgICAhbWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5lcnJvclR5cGUgJiYgbWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRhICE9PSBudWxsICYmIG1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0YSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGEubGVuZ3RoICE9PSAwKSB7XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgU05TIENsaWVudFxuICAgICAgICAgICAgY29uc3Qgc25zQ2xpZW50ID0gbmV3IFNOU0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBkcm9wIHRoZSBuZXcgc2lnbmVkLXVwIHVzZXJzIGluIGEgbWVzc2FnZSB0byB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHJlcG9ydGluZyBwcm9jZXNzaW5nIHRvcGljXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nUmVjZWlwdCA9IGF3YWl0IHNuc0NsaWVudC5zZW5kKG5ldyBQdWJsaXNoQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVG9waWNBcm46IHByb2Nlc3MuZW52Lk1JTElUQVJZX1ZFUklGSUNBVElPTl9SRVBPUlRJTkdfUFJPQ0VTU0lOR19UT1BJQ19BUk4hLFxuICAgICAgICAgICAgICAgIE1lc3NhZ2U6IEpTT04uc3RyaW5naWZ5KG1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0YSksXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogdGhlIG1lc3NhZ2UgZ3JvdXAgaWQsIHdpbGwgYmUgcmVwcmVzZW50ZWQgYnkgdGhlIHN0YXJ0IGFuZCBlbmQgZGF0ZSBjb21iaW5hdGlvbiwgc28gdGhhdCB3ZSBjYW4gZ3JvdXAgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZXBvcnRpbmcgcmVtaW5kZXIgdXBkYXRlIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgICogZm9yIGEgcGFydGljdWxhciB0aW1lZnJhbWUsIGFuZCBzb3J0IHRoZW0gaW4gdGhlIEZJRk8gcHJvY2Vzc2luZyB0b3BpYyBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBNZXNzYWdlR3JvdXBJZDogYCR7c3RhcnREYXRlLnRvSVNPU3RyaW5nKCl9LSR7ZW5kRGF0ZS50b0lTT1N0cmluZygpfWBcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZXBvcnRpbmcgbWVzc2FnZSB3YXMgcHJvcGVybHkgc2VudCB0byB0aGUgYXBwcm9wcmlhdGUgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgaWYgKG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nUmVjZWlwdCAhPT0gbnVsbCAmJiBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ1JlY2VpcHQgIT09IHVuZGVmaW5lZCAmJiBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ1JlY2VpcHQuTWVzc2FnZUlkICYmXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdSZWNlaXB0Lk1lc3NhZ2VJZC5sZW5ndGggIT09IDAgJiYgbWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdSZWNlaXB0LlNlcXVlbmNlTnVtYmVyICYmIG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nUmVjZWlwdC5TZXF1ZW5jZU51bWJlci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHJlcG9ydGluZyByZW1pbmRlciBtZXNzYWdlIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBkcm9wcGVkIGludG8gdGhlIHRvcGljLCBhbmQgd2lsbCBiZSBwaWNrZWQgdXAgYnkgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZW1pbmRlciBjb25zdW1lclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNaWxpdGFyeSB2ZXJpZmljYXRpb24gcmVwb3J0aW5nIHJlbWluZGVyIHN1Y2Nlc3NmdWxseSBzZW50IHRvIHRvcGljIGZvciBwcm9jZXNzaW5nIHdpdGggcmVjZWlwdCBpbmZvcm1hdGlvbjogJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ1JlY2VpcHQuTWVzc2FnZUlkfSAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nUmVjZWlwdC5TZXF1ZW5jZU51bWJlcn1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgICAqIGluIHRoZSBmdXR1cmUgd2UgbWlnaHQgbmVlZCBzb21lIGFsZXJ0cyBhbmQgbWV0cmljcyBlbWl0dGluZyBoZXJlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2VuZGluZyB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHJlcG9ydGluZyByZW1pbmRlciBmb3IgdGltZWZyYW1lICR7c3RhcnREYXRlLnRvSVNPU3RyaW5nKCl9LSR7ZW5kRGF0ZS50b0lTT1N0cmluZygpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIG5ldyB1c2VycywgdGhlbiBsb2cgdGhhdCBhcHByb3ByaWF0ZWx5IHNpbmNlIGl0IGlzIG5vdCBhbiBlcnJvclxuICAgICAgICAgICAgaWYgKG1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0YSAhPT0gbnVsbCAmJiBtaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGEgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm8gbmV3IHVzZXJzIHNpZ25lZC11cCBiZXR3ZWVuICR7c3RhcnREYXRlLnRvSVNPU3RyaW5nKCl9IGFuZCAke2VuZERhdGUudG9JU09TdHJpbmcoKX1gKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBubyBuZWVkIGZvciBmdXJ0aGVyIGFjdGlvbnMsIHNpbmNlIHRoaXMgZXJyb3Igd2lsbCBiZSBsb2dnZWQgYW5kIG5vdGhpbmcgd2lsbCBleGVjdXRlIGZ1cnRoZXIuXG4gICAgICAgICAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTmV3IHJlZ2lzdGVyZWQgdXNlcnMgcmV0cmlldmFsIHRocm91Z2ggR0VUIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBjYWxsIGZhaWxlZGApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICovXG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZXBvcnRpbmcgY3JvbiBldmVudCAke2Vycm9yfWApO1xuICAgIH1cbn1cbiJdfQ==