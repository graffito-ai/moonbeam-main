"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerReferral = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_sns_1 = require("@aws-sdk/client-sns");
/**
 * Function used to handle the daily referral trigger, by first
 * determining whether there are any referrals that need to be processed, and by
 * kick-starting that process for any applicable users, accordingly.
 */
const triggerReferral = async () => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
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
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        // 1) Call the getReferralsByStatus Moonbeam AppSync Query API endpoint.
        const referralResponse = await moonbeamClient.getReferralByStatus({
            status: moonbeam_models_1.ReferralStatus.Pending
        });
        // check to see if the get referrals by status call was successful or not.
        if (referralResponse !== null && referralResponse !== undefined && !referralResponse.errorMessage &&
            !referralResponse.errorType && referralResponse.data !== null && referralResponse.data !== undefined &&
            referralResponse.data.length !== 0) {
            let processedReferralsCount = 0;
            // filter through each PENDING referral
            for (const referral of referralResponse.data) {
                // initializing the SNS Client
                const snsClient = new client_sns_1.SNSClient({ region: region });
                // for any PENDING referrals, drop them into the referrals processing SNS topic for them to be processed accordingly
                const referralReceipt = await snsClient.send(new client_sns_1.PublishCommand({
                    TopicArn: process.env.REFERRAL_PROCESSING_TOPIC_ARN,
                    Message: JSON.stringify(referral),
                    /**
                     * the message group id, will be represented by the fromId, so that we can group the referral messages for a particular
                     * user id, and sort them in the FIFO processing topic accordingly.
                     */
                    MessageGroupId: referral.fromId
                }));
                // ensure that the referral message was properly sent to the appropriate processing topic
                if (referralReceipt !== null && referralReceipt !== undefined && referralReceipt.MessageId &&
                    referralReceipt.MessageId.length !== 0 && referralReceipt.SequenceNumber && referralReceipt.SequenceNumber.length !== 0) {
                    // the referral  message has been successfully dropped into the topic, and will be picked up by the referral consumer
                    console.log(`Referral successfully sent to topic for processing with receipt information: ${referralReceipt.MessageId} ${referralReceipt.SequenceNumber}`);
                    // increase the number of messages sent to the topic (representing the number of referrals sent to the topic)
                    processedReferralsCount += 1;
                }
                else {
                    /**
                     * no need for further actions, since this error will be logged and nothing will execute further.
                     * in the future we might need some alerts and metrics emitting here
                     */
                    console.log(`Unexpected error while sending referral from user ${referral.fromId} to user ${referral.toId} at ${referral.timestamp}`);
                }
            }
            // if the number of successfully processed referrals does not match the number of available referrals to process
            if (processedReferralsCount !== referralResponse.data.length) {
                console.log(`__________________________________________________________________________________________________________________________________`);
                console.log(`Was not able to successfully send all PENDING referrals. Sent ${processedReferralsCount} referrals out of ${referralResponse.data.length}`);
            }
            else {
                console.log(`__________________________________________________________________________________________________________________________________`);
                console.log(`Ran trigger for Referrals at ${new Date(Date.now()).toISOString()}, and found ${processedReferralsCount} PENDING referrals`);
            }
        }
        else {
            /**
             * no need for further actions, since this error will be logged and nothing will execute further.
             * in the future we might need some alerts and metrics emitting here
             */
            console.log(`Referrals retrieval through GET referrals by status call failed`);
        }
    }
    catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the referral cron event ${error}`);
    }
};
exports.triggerReferral = triggerReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVmZXJyYWxUcmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvUmVmZXJyYWxUcmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUFxRztBQUNyRyxvREFBOEQ7QUFFOUQ7Ozs7R0FJRztBQUNJLE1BQU0sZUFBZSxHQUFHLEtBQUssSUFBbUIsRUFBRTtJQUNyRCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDOzs7Ozs7Ozs7V0FTRztRQUNILE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV6RSx3RUFBd0U7UUFDeEUsTUFBTSxnQkFBZ0IsR0FBcUIsTUFBTSxjQUFjLENBQUMsbUJBQW1CLENBQUM7WUFDaEYsTUFBTSxFQUFFLGdDQUFjLENBQUMsT0FBTztTQUNqQyxDQUFDLENBQUM7UUFFSCwwRUFBMEU7UUFDMUUsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLElBQUksZ0JBQWdCLEtBQUssU0FBUyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWTtZQUM3RixDQUFDLGdCQUFnQixDQUFDLFNBQVMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLElBQUksS0FBSyxTQUFTO1lBQ3BHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBRXBDLElBQUksdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLHVDQUF1QztZQUN2QyxLQUFLLE1BQU0sUUFBUSxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRTtnQkFDMUMsOEJBQThCO2dCQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLHNCQUFTLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztnQkFFbEQsb0hBQW9IO2dCQUNwSCxNQUFNLGVBQWUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBYyxDQUFDO29CQUM1RCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBOEI7b0JBQ3BELE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQW9CLENBQUM7b0JBQzdDOzs7dUJBR0c7b0JBQ0gsY0FBYyxFQUFHLFFBQXNCLENBQUMsTUFBTTtpQkFDakQsQ0FBQyxDQUFDLENBQUM7Z0JBRUoseUZBQXlGO2dCQUN6RixJQUFJLGVBQWUsS0FBSyxJQUFJLElBQUksZUFBZSxLQUFLLFNBQVMsSUFBSSxlQUFlLENBQUMsU0FBUztvQkFDdEYsZUFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGVBQWUsQ0FBQyxjQUFjLElBQUksZUFBZSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN6SCxxSEFBcUg7b0JBQ3JILE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0ZBQWdGLGVBQWUsQ0FBQyxTQUFTLElBQUksZUFBZSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7b0JBQzNKLDZHQUE2RztvQkFDN0csdUJBQXVCLElBQUksQ0FBQyxDQUFDO2lCQUNoQztxQkFBTTtvQkFDSDs7O3VCQUdHO29CQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMscURBQXNELFFBQXNCLENBQUMsTUFBTSxZQUFhLFFBQXNCLENBQUMsSUFBSSxPQUFRLFFBQXNCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztpQkFDdEw7YUFDSjtZQUVELGdIQUFnSDtZQUNoSCxJQUFJLHVCQUF1QixLQUFLLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQzFELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0lBQW9JLENBQUMsQ0FBQztnQkFDbEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxpRUFBaUUsdUJBQXVCLHFCQUFxQixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUM1SjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLG9JQUFvSSxDQUFDLENBQUM7Z0JBQ2xKLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxlQUFlLHVCQUF1QixvQkFBb0IsQ0FBQyxDQUFDO2FBQzdJO1NBQ0o7YUFBTTtZQUNIOzs7ZUFHRztZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsaUVBQWlFLENBQUMsQ0FBQztTQUNsRjtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWjs7O1dBR0c7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3JGO0FBQ0wsQ0FBQyxDQUFBO0FBbEZZLFFBQUEsZUFBZSxtQkFrRjNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNb29uYmVhbUNsaWVudCwgUmVmZXJyYWwsIFJlZmVycmFsUmVzcG9uc2UsIFJlZmVycmFsU3RhdHVzfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtQdWJsaXNoQ29tbWFuZCwgU05TQ2xpZW50fSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXNuc1wiO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gaGFuZGxlIHRoZSBkYWlseSByZWZlcnJhbCB0cmlnZ2VyLCBieSBmaXJzdFxuICogZGV0ZXJtaW5pbmcgd2hldGhlciB0aGVyZSBhcmUgYW55IHJlZmVycmFscyB0aGF0IG5lZWQgdG8gYmUgcHJvY2Vzc2VkLCBhbmQgYnlcbiAqIGtpY2stc3RhcnRpbmcgdGhhdCBwcm9jZXNzIGZvciBhbnkgYXBwbGljYWJsZSB1c2VycywgYWNjb3JkaW5nbHkuXG4gKi9cbmV4cG9ydCBjb25zdCB0cmlnZ2VyUmVmZXJyYWwgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBvdmVyYWxsIHJlZmVycmFsIGNyb24gdHJpZ2dlcmluZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAqXG4gICAgICAgICAqIDEpIENhbGwgdGhlIGdldFJlZmVycmFsc0J5U3RhdHVzIEFwcFN5bmMgUXVlcnkgQVBJIGluIG9yZGVyIHRvOlxuICAgICAgICAgKiBnZXQgYW55IFBFTkRJTkcgUmVmZXJyYWxzLlxuICAgICAgICAgKlxuICAgICAgICAgKiAyKSBGb3IgYW55IFJlZmVycmFscyB0aGF0IGFyZSBQRU5ESU5HLCBkcm9wIHRoZW0gaW50byB0aGUgcmVmZXJyYWxzIHByb2Nlc3NpbmdcbiAgICAgICAgICogU05TIHRvcGljLlxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgIC8vIDEpIENhbGwgdGhlIGdldFJlZmVycmFsc0J5U3RhdHVzIE1vb25iZWFtIEFwcFN5bmMgUXVlcnkgQVBJIGVuZHBvaW50LlxuICAgICAgICBjb25zdCByZWZlcnJhbFJlc3BvbnNlOiBSZWZlcnJhbFJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0UmVmZXJyYWxCeVN0YXR1cyh7XG4gICAgICAgICAgICBzdGF0dXM6IFJlZmVycmFsU3RhdHVzLlBlbmRpbmdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgcmVmZXJyYWxzIGJ5IHN0YXR1cyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgICAgaWYgKHJlZmVycmFsUmVzcG9uc2UgIT09IG51bGwgJiYgcmVmZXJyYWxSZXNwb25zZSAhPT0gdW5kZWZpbmVkICYmICFyZWZlcnJhbFJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJlxuICAgICAgICAgICAgIXJlZmVycmFsUmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlZmVycmFsUmVzcG9uc2UuZGF0YSAhPT0gbnVsbCAmJiByZWZlcnJhbFJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgcmVmZXJyYWxSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuXG4gICAgICAgICAgICBsZXQgcHJvY2Vzc2VkUmVmZXJyYWxzQ291bnQgPSAwO1xuICAgICAgICAgICAgLy8gZmlsdGVyIHRocm91Z2ggZWFjaCBQRU5ESU5HIHJlZmVycmFsXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlZmVycmFsIG9mIHJlZmVycmFsUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgU05TIENsaWVudFxuICAgICAgICAgICAgICAgIGNvbnN0IHNuc0NsaWVudCA9IG5ldyBTTlNDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgICAgICAgICAvLyBmb3IgYW55IFBFTkRJTkcgcmVmZXJyYWxzLCBkcm9wIHRoZW0gaW50byB0aGUgcmVmZXJyYWxzIHByb2Nlc3NpbmcgU05TIHRvcGljIGZvciB0aGVtIHRvIGJlIHByb2Nlc3NlZCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVycmFsUmVjZWlwdCA9IGF3YWl0IHNuc0NsaWVudC5zZW5kKG5ldyBQdWJsaXNoQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRvcGljQXJuOiBwcm9jZXNzLmVudi5SRUZFUlJBTF9QUk9DRVNTSU5HX1RPUElDX0FSTiEsXG4gICAgICAgICAgICAgICAgICAgIE1lc3NhZ2U6IEpTT04uc3RyaW5naWZ5KHJlZmVycmFsIGFzIFJlZmVycmFsKSxcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIHRoZSBtZXNzYWdlIGdyb3VwIGlkLCB3aWxsIGJlIHJlcHJlc2VudGVkIGJ5IHRoZSBmcm9tSWQsIHNvIHRoYXQgd2UgY2FuIGdyb3VwIHRoZSByZWZlcnJhbCBtZXNzYWdlcyBmb3IgYSBwYXJ0aWN1bGFyXG4gICAgICAgICAgICAgICAgICAgICAqIHVzZXIgaWQsIGFuZCBzb3J0IHRoZW0gaW4gdGhlIEZJRk8gcHJvY2Vzc2luZyB0b3BpYyBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIE1lc3NhZ2VHcm91cElkOiAocmVmZXJyYWwgYXMgUmVmZXJyYWwpIS5mcm9tSWRcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgcmVmZXJyYWwgbWVzc2FnZSB3YXMgcHJvcGVybHkgc2VudCB0byB0aGUgYXBwcm9wcmlhdGUgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgIGlmIChyZWZlcnJhbFJlY2VpcHQgIT09IG51bGwgJiYgcmVmZXJyYWxSZWNlaXB0ICE9PSB1bmRlZmluZWQgJiYgcmVmZXJyYWxSZWNlaXB0Lk1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICByZWZlcnJhbFJlY2VpcHQuTWVzc2FnZUlkLmxlbmd0aCAhPT0gMCAmJiByZWZlcnJhbFJlY2VpcHQuU2VxdWVuY2VOdW1iZXIgJiYgcmVmZXJyYWxSZWNlaXB0LlNlcXVlbmNlTnVtYmVyLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcmVmZXJyYWwgIG1lc3NhZ2UgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGRyb3BwZWQgaW50byB0aGUgdG9waWMsIGFuZCB3aWxsIGJlIHBpY2tlZCB1cCBieSB0aGUgcmVmZXJyYWwgY29uc3VtZXJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJlZmVycmFsIHN1Y2Nlc3NmdWxseSBzZW50IHRvIHRvcGljIGZvciBwcm9jZXNzaW5nIHdpdGggcmVjZWlwdCBpbmZvcm1hdGlvbjogJHtyZWZlcnJhbFJlY2VpcHQuTWVzc2FnZUlkfSAke3JlZmVycmFsUmVjZWlwdC5TZXF1ZW5jZU51bWJlcn1gKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jcmVhc2UgdGhlIG51bWJlciBvZiBtZXNzYWdlcyBzZW50IHRvIHRoZSB0b3BpYyAocmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgcmVmZXJyYWxzIHNlbnQgdG8gdGhlIHRvcGljKVxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRSZWZlcnJhbHNDb3VudCArPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBubyBuZWVkIGZvciBmdXJ0aGVyIGFjdGlvbnMsIHNpbmNlIHRoaXMgZXJyb3Igd2lsbCBiZSBsb2dnZWQgYW5kIG5vdGhpbmcgd2lsbCBleGVjdXRlIGZ1cnRoZXIuXG4gICAgICAgICAgICAgICAgICAgICAqIGluIHRoZSBmdXR1cmUgd2UgbWlnaHQgbmVlZCBzb21lIGFsZXJ0cyBhbmQgbWV0cmljcyBlbWl0dGluZyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZW5kaW5nIHJlZmVycmFsIGZyb20gdXNlciAkeyhyZWZlcnJhbCBhcyBSZWZlcnJhbCkhLmZyb21JZH0gdG8gdXNlciAkeyhyZWZlcnJhbCBhcyBSZWZlcnJhbCkhLnRvSWR9IGF0ICR7KHJlZmVycmFsIGFzIFJlZmVycmFsKSEudGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhlIG51bWJlciBvZiBzdWNjZXNzZnVsbHkgcHJvY2Vzc2VkIHJlZmVycmFscyBkb2VzIG5vdCBtYXRjaCB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSByZWZlcnJhbHMgdG8gcHJvY2Vzc1xuICAgICAgICAgICAgaWYgKHByb2Nlc3NlZFJlZmVycmFsc0NvdW50ICE9PSByZWZlcnJhbFJlc3BvbnNlLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgV2FzIG5vdCBhYmxlIHRvIHN1Y2Nlc3NmdWxseSBzZW5kIGFsbCBQRU5ESU5HIHJlZmVycmFscy4gU2VudCAke3Byb2Nlc3NlZFJlZmVycmFsc0NvdW50fSByZWZlcnJhbHMgb3V0IG9mICR7cmVmZXJyYWxSZXNwb25zZS5kYXRhLmxlbmd0aH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmFuIHRyaWdnZXIgZm9yIFJlZmVycmFscyBhdCAke25ldyBEYXRlKERhdGUubm93KCkpLnRvSVNPU3RyaW5nKCl9LCBhbmQgZm91bmQgJHtwcm9jZXNzZWRSZWZlcnJhbHNDb3VudH0gUEVORElORyByZWZlcnJhbHNgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFJlZmVycmFscyByZXRyaWV2YWwgdGhyb3VnaCBHRVQgcmVmZXJyYWxzIGJ5IHN0YXR1cyBjYWxsIGZhaWxlZGApO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICovXG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgdGhlIHJlZmVycmFsIGNyb24gZXZlbnQgJHtlcnJvcn1gKTtcbiAgICB9XG59XG4iXX0=