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
         * For Referrals with campaign codes of type "RAFFLEREGDEC23" or "RAFFLEREGJAN24", do the following:
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
                    case moonbeam_models_1.MarketingCampaignCode.Raffleregfeb24:
                    case moonbeam_models_1.MarketingCampaignCode.Raffleregmar24:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVmZXJyYWxQcm9jZXNzb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvUmVmZXJyYWxQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtEQU9tQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDaEYsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0M7Ozs7Ozs7Ozs7Ozs7Ozs7V0FnQkc7UUFDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFekUsbUVBQW1FO1FBQ25FLE1BQU0sbUJBQW1CLEdBQWdDLE1BQU0sY0FBYyxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFFdkcsMkVBQTJFO1FBQzNFLElBQUksbUJBQW1CLEtBQUssSUFBSSxJQUFJLG1CQUFtQixLQUFLLFNBQVMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVk7ZUFDbkcsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLElBQUksbUJBQW1CLENBQUMsSUFBSSxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3hHLDJGQUEyRjtZQUMzRixLQUFLLE1BQU0sY0FBYyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQ3hDLHlFQUF5RTtnQkFDekUsTUFBTSxRQUFRLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFhLENBQUM7Z0JBRXZFLFFBQVEsUUFBUSxDQUFDLFlBQVksRUFBRTtvQkFDM0IsS0FBSyx1Q0FBcUIsQ0FBQyxjQUFjLENBQUM7b0JBQzFDLEtBQUssdUNBQXFCLENBQUMsY0FBYyxDQUFDO29CQUMxQyxLQUFLLHVDQUFxQixDQUFDLGNBQWMsQ0FBQztvQkFDMUMsS0FBSyx1Q0FBcUIsQ0FBQyxjQUFjO3dCQUNyQyw4RkFBOEY7d0JBQzlGLElBQUksV0FBVyxHQUFZLEtBQUssQ0FBQzt3QkFFakM7OzsyQkFHRzt3QkFDSCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFOzRCQUMxQyxJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsRUFBRSxFQUFFO2dDQUN4RCxXQUFXLEdBQUcsSUFBSSxDQUFBOzZCQUNyQjt3QkFDTCxDQUFDLENBQUMsQ0FBQzt3QkFDSCxJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxRQUFRLENBQUMsSUFBSSxrREFBa0QsQ0FBQyxDQUFDOzRCQUVyRixtR0FBbUc7NEJBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0NBQ2QsY0FBYyxFQUFFLGNBQWMsQ0FBQyxTQUFTOzZCQUMzQyxDQUFDLENBQUM7eUJBQ047NkJBQU07NEJBQ0g7OzsrQkFHRzs0QkFDSCxNQUFNLHVCQUF1QixHQUFxQixNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUM7Z0NBQ2xGLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtnQ0FDdkIsTUFBTSxFQUFFLGdDQUFjLENBQUMsS0FBSztnQ0FDNUIsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTOzZCQUNoQyxDQUFDLENBQUM7NEJBRUgsdUVBQXVFOzRCQUN2RSxJQUFJLHVCQUF1QixLQUFLLElBQUksSUFBSSx1QkFBdUIsS0FBSyxTQUFTLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTO21DQUM1RyxDQUFDLHVCQUF1QixDQUFDLFlBQVksSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0NBQ3ZILE1BQU0sZUFBZSxHQUFhLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsQ0FBQztnQ0FFbkUsdUVBQXVFO2dDQUN2RSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssZ0NBQWMsQ0FBQyxLQUFLLEVBQUU7b0NBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsMENBQTBDLFFBQVEsQ0FBQyxNQUFNLGtCQUFrQixRQUFRLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztpQ0FDaEg7cUNBQU07b0NBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7b0NBRWhGLG1HQUFtRztvQ0FDbkcsWUFBWSxDQUFDLElBQUksQ0FBQzt3Q0FDZCxjQUFjLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO3FDQUM3QyxDQUFDLENBQUM7aUNBQ047NkJBQ0o7aUNBQU07Z0NBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO2dDQUV0RSxtR0FBbUc7Z0NBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUM7b0NBQ2QsY0FBYyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztpQ0FDN0MsQ0FBQyxDQUFDOzZCQUNOO3lCQUNKO3dCQUNELE1BQU07b0JBQ1Y7d0JBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxRUFBcUUsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7d0JBRTFHLG1HQUFtRzt3QkFDbkcsWUFBWSxDQUFDLElBQUksQ0FBQzs0QkFDZCxjQUFjLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO3lCQUM3QyxDQUFDLENBQUM7d0JBQ0gsTUFBTTtpQkFDYjthQUNKO1NBQ0o7YUFBTTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQztZQUUzRSxtR0FBbUc7WUFDbkcsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDZCxjQUFjLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQzdDLENBQUMsQ0FBQztTQUNOO1FBRUQ7Ozs7O1dBS0c7UUFDSCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsWUFBWTtTQUNsQyxDQUFBO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLG1CQUFtQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRWxHOzs7OztXQUtHO1FBQ0gsT0FBTztZQUNILGlCQUFpQixFQUFFLENBQUM7b0JBQ2hCLGdHQUFnRztvQkFDaEcsY0FBYyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztpQkFDN0MsQ0FBQztTQUNMLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXZKWSxRQUFBLGVBQWUsbUJBdUozQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U1FTQmF0Y2hSZXNwb25zZSwgU1FTRXZlbnR9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5pbXBvcnQge1NRU0JhdGNoSXRlbUZhaWx1cmV9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvc3FzXCI7XG5pbXBvcnQge1xuICAgIEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSxcbiAgICBNYXJrZXRpbmdDYW1wYWlnbkNvZGUsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgUmVmZXJyYWwsXG4gICAgUmVmZXJyYWxSZXNwb25zZSxcbiAgICBSZWZlcnJhbFN0YXR1c1xufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIFJlZmVycmFsUHJvY2Vzc29yIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gZXZlbnQgdGhlIHtAbGluayBTUVNFdmVudH0gdG8gYmUgcHJvY2Vzc2VkLCBjb250YWluaW5nIHRoZSByZWZlcnJhbCBpbmZvcm1hdGlvblxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBTUVNCYXRjaFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgcHJvY2Vzc1JlZmVycmFsID0gYXN5bmMgKGV2ZW50OiBTUVNFdmVudCk6IFByb21pc2U8U1FTQmF0Y2hSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpbml0aWFsaXppbmcgdGhlIGJhdGNoIHJlc3BvbnNlLCBhcyBhbiBlbXB0eSBhcnJheSwgdGhhdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGVycm9ycywgaWYgYW55IHRocm91Z2hvdXQgdGhlIHByb2Nlc3NpbmdcbiAgICAgICAgICpcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5LiBJZiB3ZSB3YW50IHRvIGluZGljYXRlIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIGVycm9ycyxcbiAgICAgICAgICogZm9yIGVhY2ggaW5kaXZpZHVhbCBtZXNzYWdlLCBiYXNlZCBvbiBpdHMgSUQsIHdlIGhhdmUgdG8gYWRkIGl0IGluIHRoZSBmaW5hbCBiYXRjaCByZXNwb25zZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpdGVtRmFpbHVyZXM6IFNRU0JhdGNoSXRlbUZhaWx1cmVbXSA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgb3ZlcmFsbCByZWZlcnJhbCBwcm9jZXNzaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgICAgICpcbiAgICAgICAgICogMSkgQ2FsbCB0aGUgZ2V0RWxpZ2libGVMaW5rZWRVc2VycyBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgdG8gcmV0cmlldmUgYWxsIHVzZXJzIHdobyBoYXZlIGEgbGlua2VkIGNhcmRcbiAgICAgICAgICogYXNzb2NpYXRlZCB3aXRoIHRoZWlyIGFjY291bnQgKGNhbGwgdGhpcyBvbmx5IG9uY2UpLlxuICAgICAgICAgKlxuICAgICAgICAgKiBGb3IgUmVmZXJyYWxzIHdpdGggY2FtcGFpZ24gY29kZXMgb2YgdHlwZSBcIlJBRkZMRVJFR0RFQzIzXCIgb3IgXCJSQUZGTEVSRUdKQU4yNFwiLCBkbyB0aGUgZm9sbG93aW5nOlxuICAgICAgICAgKlxuICAgICAgICAgKiAyKSBEZXRlcm1pbmUgd2hldGhlciB0aGUgdG9JZCBmcm9tIHRoZSBpbmNvbWluZyByZWZlcnJhbCBuZWVkZWQgcHJvY2Vzc2luZyBpcyBhc3NvY2lhdGVkIHdpdGggYSB1c2VyIHdobyBoYXNcbiAgICAgICAgICogYSBsaW5rZWQgY2FyZCB0byB0aGVpciBhY2NvdW50LlxuICAgICAgICAgKiAzKSBGb3IgZWFjaCBlbGlnaWJsZSB1c2VyIGZyb20gdGhlIHByZXZpb3VzIHN0ZXAsIGNhbGwgdGhlIHVwZGF0ZVJlZmVycmFsIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50LCBpbiBvcmRlclxuICAgICAgICAgKiB0byB1cGRhdGUgdGhlIHJlZmVycmFsIG9iamVjdCdzIHN0YXR1cyB0byBWQUxJRFxuICAgICAgICAgKlxuICAgICAgICAgKlxuICAgICAgICAgKiBmaXJzdCwgYmVmb3JlIHN0YXJ0aW5nLCBpbml0aWFsaXplIHRoZSBNb29uYmVhbSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50c1xuICAgICAgICAgKiBmb3IgdGhpcyBoYW5kbGVyLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgIC8vIDEpIENhbGwgdGhlIGdldEVsaWdpYmxlTGlua2VkVXNlcnMgTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnRcbiAgICAgICAgY29uc3QgbGlua2VkVXNlcnNSZXNwb25zZTogRWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0RWxpZ2libGVMaW5rZWRVc2VycygpO1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZ2V0IGVsaWdpYmxlIGxpbmtlZCB1c2VyIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgICAgICBpZiAobGlua2VkVXNlcnNSZXNwb25zZSAhPT0gbnVsbCAmJiBsaW5rZWRVc2Vyc1Jlc3BvbnNlICE9PSB1bmRlZmluZWQgJiYgIWxpbmtlZFVzZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAmJiAhbGlua2VkVXNlcnNSZXNwb25zZS5lcnJvclR5cGUgJiYgbGlua2VkVXNlcnNSZXNwb25zZS5kYXRhICYmIGxpbmtlZFVzZXJzUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGZvciBlYWNoIHJlZmVycmFsIG9iamVjdCByZXBlYXQgc3RlcHMgMiBhbmQgMyBmcm9tIGFib3ZlLCBkZXBlbmRpbmcgb24gdGhlIGNhbXBhaWduIGNvZGVcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVmZXJyYWxSZWNvcmQgb2YgZXZlbnQuUmVjb3Jkcykge1xuICAgICAgICAgICAgICAgIC8vIGZpcnN0LCBjb252ZXJ0IHRoZSBpbmNvbWluZyBldmVudCBtZXNzYWdlIGJvZHksIGludG8gYSByZWZlcnJhbCBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCByZWZlcnJhbDogUmVmZXJyYWwgPSBKU09OLnBhcnNlKHJlZmVycmFsUmVjb3JkLmJvZHkpIGFzIFJlZmVycmFsO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZWZlcnJhbC5jYW1wYWlnbkNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBNYXJrZXRpbmdDYW1wYWlnbkNvZGUuUmFmZmxlcmVnZGVjMjM6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTWFya2V0aW5nQ2FtcGFpZ25Db2RlLlJhZmZsZXJlZ2phbjI0OlxuICAgICAgICAgICAgICAgICAgICBjYXNlIE1hcmtldGluZ0NhbXBhaWduQ29kZS5SYWZmbGVyZWdmZWIyNDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBNYXJrZXRpbmdDYW1wYWlnbkNvZGUuUmFmZmxlcmVnbWFyMjQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmbGFnIHNwZWNpZnlpbmcgd2hldGhlciB0aGUgcmVmZXJyZWQgdXNlciBmcm9tIHRoZSByZWZlcnJhbCBtYXRjaGVzIGEgdXNlciB3aXRoIGxpbmtlZCBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXNlck1hdGNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiAyKSBEZXRlcm1pbmUgd2hldGhlciB0aGUgdG9JZCBmcm9tIHRoZSBpbmNvbWluZyByZWZlcnJhbCBuZWVkZWQgcHJvY2Vzc2luZyBpcyBhc3NvY2lhdGVkIHdpdGggYSB1c2VyIHdobyBoYXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGEgbGlua2VkIGNhcmQgdG8gdGhlaXIgYWNjb3VudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua2VkVXNlcnNSZXNwb25zZS5kYXRhLmZvckVhY2gobGlua2VkVXNlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmtlZFVzZXIgIT09IG51bGwgJiYgcmVmZXJyYWwudG9JZCA9PT0gbGlua2VkVXNlci5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTWF0Y2hlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdXNlck1hdGNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXNlciAke3JlZmVycmFsLnRvSWR9IGZyb20gcmVmZXJyYWwgbm90IG1hdGNoZWQgd2l0aCBhbnkgbGlua2VkIHVzZXJzYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiByZWZlcnJhbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogMykgRm9yIGVhY2ggZWxpZ2libGUgdXNlciBmcm9tIHRoZSBwcmV2aW91cyBzdGVwLCBjYWxsIHRoZSB1cGRhdGVSZWZlcnJhbCBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgaW4gb3JkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0byB1cGRhdGUgdGhlIHJlZmVycmFsIG9iamVjdCdzIHN0YXR1cyB0byBWQUxJRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRSZWZlcnJhbFJlc3BvbnNlOiBSZWZlcnJhbFJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQudXBkYXRlUmVmZXJyYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tSWQ6IHJlZmVycmFsLmZyb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBSZWZlcnJhbFN0YXR1cy5WYWxpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiByZWZlcnJhbC50aW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXBkYXRlIHJlZmVycmFsIHVzZXIgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3QuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWRSZWZlcnJhbFJlc3BvbnNlICE9PSBudWxsICYmIHVwZGF0ZWRSZWZlcnJhbFJlc3BvbnNlICE9PSB1bmRlZmluZWQgJiYgIXVwZGF0ZWRSZWZlcnJhbFJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAhdXBkYXRlZFJlZmVycmFsUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmIHVwZGF0ZWRSZWZlcnJhbFJlc3BvbnNlLmRhdGEgJiYgdXBkYXRlZFJlZmVycmFsUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFJlZmVycmFsOiBSZWZlcnJhbCA9IHVwZGF0ZWRSZWZlcnJhbFJlc3BvbnNlLmRhdGFbMF0hO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSByZXR1cm5lZCBzdGF0dXMgaXMgVmFsaWQgZm9yIHRoZSB1cGRhdGVkIHJlZmVycmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVkUmVmZXJyYWwuc3RhdHVzID09PSBSZWZlcnJhbFN0YXR1cy5WYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN1Y2Nlc3NmdWxseSBwcm9jZXNzZWQgcmVmZXJyYWwgZnJvbUlkICR7cmVmZXJyYWwuZnJvbUlkfSBhbmQgdGltZXN0YW1wICR7cmVmZXJyYWwudGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVwZGF0ZWQgcmVmZXJyYWwgc3RhdHVzIGlzIG5vdCBWYWxpZCAtICR7dXBkYXRlZFJlZmVycmFsLnN0YXR1c31gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVcGRhdGUgcmVmZXJyYWwgdGhyb3VnaCB1cGRhdGVSZWZlcnJhbCBBUEkgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuc3VwcG9ydGVkIGNhbXBhaWduIGNvZGUgIGZvciByZWZlcnJhbCBhdHRlbXB0ZWQgdG8gYmUgcHJvY2Vzc2VkICR7cmVmZXJyYWwuY2FtcGFpZ25Db2RlfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogZXZlbnQuUmVjb3Jkc1swXS5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYExpbmtlZCB1c2VycyByZXRyaWV2YWwgdGhyb3VnaCBHRVQgbGlua2VkIHVzZXJzIGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBldmVudC5SZWNvcmRzWzBdLm1lc3NhZ2VJZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5IGhlcmUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiYXRjaEl0ZW1GYWlsdXJlczogaXRlbUZhaWx1cmVzXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQpfSByZWZlcnJhbCBldmVudCAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm5zIGEgYmF0Y2ggcmVzcG9uc2UgZmFpbHVyZSBmb3IgdGhlIHBhcnRpY3VsYXIgbWVzc2FnZSBJRHMgd2hpY2ggZmFpbGVkXG4gICAgICAgICAqIGluIHRoaXMgY2FzZSwgdGhlIExhbWJkYSBmdW5jdGlvbiBET0VTIE5PVCBkZWxldGUgdGhlIGluY29taW5nIG1lc3NhZ2VzIGZyb20gdGhlIHF1ZXVlLCBhbmQgaXQgbWFrZXMgaXQgYXZhaWxhYmxlL3Zpc2libGUgYWdhaW5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBbe1xuICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGNhc2UsIHdlIG9ubHkgcHJvY2VzcyAxIHJlY29yZCBhdCBhIHRpbWUsIHdlIG1pZ2h0IG5lZWQgdG8gY2hhbmdlIHRoaXMgaW4gdGhlIGZ1dHVyZVxuICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBldmVudC5SZWNvcmRzWzBdLm1lc3NhZ2VJZFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==