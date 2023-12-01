"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReferral = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * ReferralProcessor handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the referral information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processReferral = async (event) => {
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
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        // 1) Call the getEligibleLinkedUsers Moonbeam AppSync API endpoint
        const linkedUsersResponse = await moonbeamClient.getEligibleLinkedUsers();
        // check to see if the get eligible linked user call was successful or not.
        if (linkedUsersResponse !== null && linkedUsersResponse !== undefined && !linkedUsersResponse.errorMessage
            && !linkedUsersResponse.errorType && linkedUsersResponse.data && linkedUsersResponse.data.length !== 0) {
            // for each referral object repeat steps 2 and 3 from above, depending on the campaign code
            for (const referralRecord of event.Records) {
                // first, convert the incoming event message body, into a referral object
                const referral = JSON.parse(referralRecord.body);
                switch (referral.campaignCode) {
                    case moonbeam_models_1.MarketingCampaignCode.Raffleregdec23:
                    case moonbeam_models_1.MarketingCampaignCode.Raffleregjan24:
                        // flag specifying whether the referred user from the referral matches a user with linked card
                        let userMatched = false;
                        /**
                         * 2) Determine whether the toId from the incoming referral needed processing is associated with a user who has
                         * a linked card to their account.
                         */
                        linkedUsersResponse.data.forEach(linkedUser => {
                            if (linkedUser !== null && referral.toId === linkedUser.id) {
                                userMatched = true;
                            }
                        });
                        if (!userMatched) {
                            console.log(`User ${referral.toId} from referral not matched with any linked users`);
                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: referralRecord.messageId
                            });
                        }
                        else {
                            /**
                             * 3) For each eligible user from the previous step, call the updateReferral Moonbeam AppSync API endpoint, in order
                             * to update the referral object's status to VALID
                             */
                            const updatedReferralResponse = await moonbeamClient.updateReferral({
                                fromId: referral.fromId,
                                status: moonbeam_models_1.ReferralStatus.Valid,
                                timestamp: referral.timestamp
                            });
                            // check to see if the update referral user call was successful or not.
                            if (updatedReferralResponse !== null && updatedReferralResponse !== undefined && !updatedReferralResponse.errorType
                                && !updatedReferralResponse.errorMessage && updatedReferralResponse.data && updatedReferralResponse.data.length !== 0) {
                                const updatedReferral = updatedReferralResponse.data[0];
                                // make sure that the returned status is Valid for the updated referral
                                if (updatedReferral.status === moonbeam_models_1.ReferralStatus.Valid) {
                                    console.log(`Successfully processed referral fromId ${referral.fromId} and timestamp ${referral.timestamp}`);
                                }
                                else {
                                    console.log(`Updated referral status is not Valid - ${updatedReferral.status}`);
                                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                    itemFailures.push({
                                        itemIdentifier: event.Records[0].messageId
                                    });
                                }
                            }
                            else {
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
        }
        else {
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
        };
    }
    catch (error) {
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
        };
    }
};
exports.processReferral = processReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVmZXJyYWxQcm9jZXNzb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvUmVmZXJyYWxQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtEQU9tQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDaEYsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0M7Ozs7Ozs7Ozs7Ozs7Ozs7V0FnQkc7UUFDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFekUsbUVBQW1FO1FBQ25FLE1BQU0sbUJBQW1CLEdBQWdDLE1BQU0sY0FBYyxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFFdkcsMkVBQTJFO1FBQzNFLElBQUksbUJBQW1CLEtBQUssSUFBSSxJQUFJLG1CQUFtQixLQUFLLFNBQVMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVk7ZUFDbkcsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLElBQUksbUJBQW1CLENBQUMsSUFBSSxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3hHLDJGQUEyRjtZQUMzRixLQUFLLE1BQU0sY0FBYyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQ3hDLHlFQUF5RTtnQkFDekUsTUFBTSxRQUFRLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFhLENBQUM7Z0JBRXZFLFFBQVEsUUFBUSxDQUFDLFlBQVksRUFBRTtvQkFD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QUMsU0FBUzthQUM3QyxDQUFDLENBQUM7U0FDTjtRQUVEOzs7OztXQUtHO1FBQ0gsT0FBTztZQUNILGlCQUFpQixFQUFFLFlBQVk7U0FDbEMsQ0FBQTtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUVsRzs7Ozs7V0FLRztRQUNILE9BQU87WUFDSCxpQkFBaUIsRUFBRSxDQUFDO29CQUNoQixnR0FBZ0c7b0JBQ2hHLGNBQWMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQzdDLENBQUM7U0FDTCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUFySlksUUFBQSxlQUFlLG1CQXFKM0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NRU0JhdGNoUmVzcG9uc2UsIFNRU0V2ZW50fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtTUVNCYXRjaEl0ZW1GYWlsdXJlfSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL3Nxc1wiO1xuaW1wb3J0IHtcbiAgICBFbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2UsXG4gICAgTWFya2V0aW5nQ2FtcGFpZ25Db2RlLFxuICAgIE1vb25iZWFtQ2xpZW50LFxuICAgIFJlZmVycmFsLFxuICAgIFJlZmVycmFsUmVzcG9uc2UsXG4gICAgUmVmZXJyYWxTdGF0dXNcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBSZWZlcnJhbFByb2Nlc3NvciBoYW5kbGVyXG4gKlxuICogQHBhcmFtIGV2ZW50IHRoZSB7QGxpbmsgU1FTRXZlbnR9IHRvIGJlIHByb2Nlc3NlZCwgY29udGFpbmluZyB0aGUgcmVmZXJyYWwgaW5mb3JtYXRpb25cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgU1FTQmF0Y2hSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHByb2Nlc3NSZWZlcnJhbCA9IGFzeW5jIChldmVudDogU1FTRXZlbnQpOiBQcm9taXNlPFNRU0JhdGNoUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvKipcbiAgICAgICAgICogaW5pdGlhbGl6aW5nIHRoZSBiYXRjaCByZXNwb25zZSwgYXMgYW4gZW1wdHkgYXJyYXksIHRoYXQgd2lsbCBiZSBwb3B1bGF0ZWQgd2l0aCBlcnJvcnMsIGlmIGFueSB0aHJvdWdob3V0IHRoZSBwcm9jZXNzaW5nXG4gICAgICAgICAqXG4gICAgICAgICAqIGZvciB0aGUgTGFtYmRhIHRvIGluZGljYXRlIFNRUyB0aGF0IHRoZXJlIGhhdmUgYmVlbiBubyBmYWlsdXJlcywgYW5kIHRodXMgZW5hYmxlIHRoZSBkZWxldGlvbiBvZiBhbGwgcHJvY2Vzc2VkIG1lc3NhZ2VzXG4gICAgICAgICAqIGZyb20gdGhlIHF1ZXVlLCB3ZSBoYXZlIHRvIHJldHVybiBhbiBlbXB0eSBiYXRjaEl0ZW1GYWlsdXJlcyBhcnJheS4gSWYgd2Ugd2FudCB0byBpbmRpY2F0ZSB0aGF0IHRoZXJlIGhhdmUgYmVlbiBlcnJvcnMsXG4gICAgICAgICAqIGZvciBlYWNoIGluZGl2aWR1YWwgbWVzc2FnZSwgYmFzZWQgb24gaXRzIElELCB3ZSBoYXZlIHRvIGFkZCBpdCBpbiB0aGUgZmluYWwgYmF0Y2ggcmVzcG9uc2VcbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaXRlbUZhaWx1cmVzOiBTUVNCYXRjaEl0ZW1GYWlsdXJlW10gPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG92ZXJhbGwgcmVmZXJyYWwgcHJvY2Vzc2luZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAqXG4gICAgICAgICAqIDEpIENhbGwgdGhlIGdldEVsaWdpYmxlTGlua2VkVXNlcnMgTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHJldHJpZXZlIGFsbCB1c2VycyB3aG8gaGF2ZSBhIGxpbmtlZCBjYXJkXG4gICAgICAgICAqIGFzc29jaWF0ZWQgd2l0aCB0aGVpciBhY2NvdW50IChjYWxsIHRoaXMgb25seSBvbmNlKS5cbiAgICAgICAgICpcbiAgICAgICAgICogRm9yIFJlZmVycmFscyB3aXRoIGNhbXBhaWduIGNvZGVzIG9mIHR5cGUgXCJSQUZGTEVSRUdERUMyM1wiIG9yIFwiUkFGRkxFUkVHREVDMjRcIiwgZG8gdGhlIGZvbGxvd2luZzpcbiAgICAgICAgICpcbiAgICAgICAgICogMikgRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIHRvSWQgZnJvbSB0aGUgaW5jb21pbmcgcmVmZXJyYWwgbmVlZGVkIHByb2Nlc3NpbmcgaXMgYXNzb2NpYXRlZCB3aXRoIGEgdXNlciB3aG8gaGFzXG4gICAgICAgICAqIGEgbGlua2VkIGNhcmQgdG8gdGhlaXIgYWNjb3VudC5cbiAgICAgICAgICogMykgRm9yIGVhY2ggZWxpZ2libGUgdXNlciBmcm9tIHRoZSBwcmV2aW91cyBzdGVwLCBjYWxsIHRoZSB1cGRhdGVSZWZlcnJhbCBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgaW4gb3JkZXJcbiAgICAgICAgICogdG8gdXBkYXRlIHRoZSByZWZlcnJhbCBvYmplY3QncyBzdGF0dXMgdG8gVkFMSURcbiAgICAgICAgICpcbiAgICAgICAgICpcbiAgICAgICAgICogZmlyc3QsIGJlZm9yZSBzdGFydGluZywgaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHNcbiAgICAgICAgICogZm9yIHRoaXMgaGFuZGxlci5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAvLyAxKSBDYWxsIHRoZSBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50XG4gICAgICAgIGNvbnN0IGxpbmtlZFVzZXJzUmVzcG9uc2U6IEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmdldEVsaWdpYmxlTGlua2VkVXNlcnMoKTtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGdldCBlbGlnaWJsZSBsaW5rZWQgdXNlciBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgICAgaWYgKGxpbmtlZFVzZXJzUmVzcG9uc2UgIT09IG51bGwgJiYgbGlua2VkVXNlcnNSZXNwb25zZSAhPT0gdW5kZWZpbmVkICYmICFsaW5rZWRVc2Vyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZVxuICAgICAgICAgICAgJiYgIWxpbmtlZFVzZXJzUmVzcG9uc2UuZXJyb3JUeXBlICYmIGxpbmtlZFVzZXJzUmVzcG9uc2UuZGF0YSAmJiBsaW5rZWRVc2Vyc1Jlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBmb3IgZWFjaCByZWZlcnJhbCBvYmplY3QgcmVwZWF0IHN0ZXBzIDIgYW5kIDMgZnJvbSBhYm92ZSwgZGVwZW5kaW5nIG9uIHRoZSBjYW1wYWlnbiBjb2RlXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlZmVycmFsUmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCwgY29udmVydCB0aGUgaW5jb21pbmcgZXZlbnQgbWVzc2FnZSBib2R5LCBpbnRvIGEgcmVmZXJyYWwgb2JqZWN0XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmZXJyYWw6IFJlZmVycmFsID0gSlNPTi5wYXJzZShyZWZlcnJhbFJlY29yZC5ib2R5KSBhcyBSZWZlcnJhbDtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVmZXJyYWwuY2FtcGFpZ25Db2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTWFya2V0aW5nQ2FtcGFpZ25Db2RlLlJhZmZsZXJlZ2RlYzIzOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIE1hcmtldGluZ0NhbXBhaWduQ29kZS5SYWZmbGVyZWdqYW4yNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZsYWcgc3BlY2lmeWluZyB3aGV0aGVyIHRoZSByZWZlcnJlZCB1c2VyIGZyb20gdGhlIHJlZmVycmFsIG1hdGNoZXMgYSB1c2VyIHdpdGggbGlua2VkIGNhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1c2VyTWF0Y2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIDIpIERldGVybWluZSB3aGV0aGVyIHRoZSB0b0lkIGZyb20gdGhlIGluY29taW5nIHJlZmVycmFsIG5lZWRlZCBwcm9jZXNzaW5nIGlzIGFzc29jaWF0ZWQgd2l0aCBhIHVzZXIgd2hvIGhhc1xuICAgICAgICAgICAgICAgICAgICAgICAgICogYSBsaW5rZWQgY2FyZCB0byB0aGVpciBhY2NvdW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rZWRVc2Vyc1Jlc3BvbnNlLmRhdGEuZm9yRWFjaChsaW5rZWRVc2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGlua2VkVXNlciAhPT0gbnVsbCAmJiByZWZlcnJhbC50b0lkID09PSBsaW5rZWRVc2VyLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJNYXRjaGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF1c2VyTWF0Y2hlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVc2VyICR7cmVmZXJyYWwudG9JZH0gZnJvbSByZWZlcnJhbCBub3QgbWF0Y2hlZCB3aXRoIGFueSBsaW5rZWQgdXNlcnNgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHJlZmVycmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAzKSBGb3IgZWFjaCBlbGlnaWJsZSB1c2VyIGZyb20gdGhlIHByZXZpb3VzIHN0ZXAsIGNhbGwgdGhlIHVwZGF0ZVJlZmVycmFsIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50LCBpbiBvcmRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRvIHVwZGF0ZSB0aGUgcmVmZXJyYWwgb2JqZWN0J3Mgc3RhdHVzIHRvIFZBTElEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFJlZmVycmFsUmVzcG9uc2U6IFJlZmVycmFsUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC51cGRhdGVSZWZlcnJhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21JZDogcmVmZXJyYWwuZnJvbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFJlZmVycmFsU3RhdHVzLlZhbGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHJlZmVycmFsLnRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB1cGRhdGUgcmVmZXJyYWwgdXNlciBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlZFJlZmVycmFsUmVzcG9uc2UgIT09IG51bGwgJiYgdXBkYXRlZFJlZmVycmFsUmVzcG9uc2UgIT09IHVuZGVmaW5lZCAmJiAhdXBkYXRlZFJlZmVycmFsUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICF1cGRhdGVkUmVmZXJyYWxSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgdXBkYXRlZFJlZmVycmFsUmVzcG9uc2UuZGF0YSAmJiB1cGRhdGVkUmVmZXJyYWxSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkUmVmZXJyYWw6IFJlZmVycmFsID0gdXBkYXRlZFJlZmVycmFsUmVzcG9uc2UuZGF0YVswXSE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIHJldHVybmVkIHN0YXR1cyBpcyBWYWxpZCBmb3IgdGhlIHVwZGF0ZWQgcmVmZXJyYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWRSZWZlcnJhbC5zdGF0dXMgPT09IFJlZmVycmFsU3RhdHVzLlZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3VjY2Vzc2Z1bGx5IHByb2Nlc3NlZCByZWZlcnJhbCBmcm9tSWQgJHtyZWZlcnJhbC5mcm9tSWR9IGFuZCB0aW1lc3RhbXAgJHtyZWZlcnJhbC50aW1lc3RhbXB9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXBkYXRlZCByZWZlcnJhbCBzdGF0dXMgaXMgbm90IFZhbGlkIC0gJHt1cGRhdGVkUmVmZXJyYWwuc3RhdHVzfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogZXZlbnQuUmVjb3Jkc1swXS5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVwZGF0ZSByZWZlcnJhbCB0aHJvdWdoIHVwZGF0ZVJlZmVycmFsIEFQSSBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogZXZlbnQuUmVjb3Jkc1swXS5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5zdXBwb3J0ZWQgY2FtcGFpZ24gY29kZSAgZm9yIHJlZmVycmFsIGF0dGVtcHRlZCB0byBiZSBwcm9jZXNzZWQgJHtyZWZlcnJhbC5jYW1wYWlnbkNvZGV9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBldmVudC5SZWNvcmRzWzBdLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTGlua2VkIHVzZXJzIHJldHJpZXZhbCB0aHJvdWdoIEdFVCBsaW5rZWQgdXNlcnMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkgaGVyZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBpdGVtRmFpbHVyZXNcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgJHtKU09OLnN0cmluZ2lmeShldmVudCl9IHJlZmVycmFsIGV2ZW50ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBiYXRjaCByZXNwb25zZSBmYWlsdXJlIGZvciB0aGUgcGFydGljdWxhciBtZXNzYWdlIElEcyB3aGljaCBmYWlsZWRcbiAgICAgICAgICogaW4gdGhpcyBjYXNlLCB0aGUgTGFtYmRhIGZ1bmN0aW9uIERPRVMgTk9UIGRlbGV0ZSB0aGUgaW5jb21pbmcgbWVzc2FnZXMgZnJvbSB0aGUgcXVldWUsIGFuZCBpdCBtYWtlcyBpdCBhdmFpbGFibGUvdmlzaWJsZSBhZ2FpblxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IFt7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FzZSwgd2Ugb25seSBwcm9jZXNzIDEgcmVjb3JkIGF0IGEgdGltZSwgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdGhpcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxufVxuIl19