"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerCardExpirationBackFill = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * Function used to handle the back-fill of the all the cards'
 * expiration dates.
 *
 * @returns a {@link Promise} of {@link void}, since the EventBridger
 * event trigger, will execute a cron job and not return anything.
 */
const triggerCardExpirationBackFill = async () => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * The overall card expiration data back-fill cron triggering, will be made up of the following steps:
         *
         * 1) Call the getEligibleLinkedUsers Moonbeam AppSync API, in order to get all the users which have
         * linked cards.
         *
         * 2) For each user, loop through their linked cards (up to 3 at the moment), and call the getCardDetails
         * Olive API, in order to retrieve the card's expiration date.
         *
         * 3) Call the updateCard Moonbeam AppSync API, in order to update the expiration date for each one of those
         * cards internally.
         *
         * First initialize all the clients that we will need in order to make these API calls
         */
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
        // 1) Call the getEligibleLinkedUsers Moonbeam AppSync API endpoint
        const linkedUsersResponse = await moonbeamClient.getEligibleLinkedUsers();
        // check to see if the get eligible linked user call was successful or not.
        if (linkedUsersResponse !== null && linkedUsersResponse !== undefined && !linkedUsersResponse.errorMessage
            && !linkedUsersResponse.errorType && linkedUsersResponse.data && linkedUsersResponse.data.length !== 0) {
            const failedUpdates = [];
            for (const linkedUser of linkedUsersResponse.data) {
                // make sure that we have appropriately formatted retrieved linked users
                if (linkedUser !== null) {
                    for (const cardId of linkedUser.cardIds) {
                        if (cardId !== null) {
                            // call the getCardDetails Olive API, in order to retrieve the card's expiration date.
                            const expirationDateResponse = await oliveClient.getCardDetails(cardId);
                            // check to see if the get card details call was successful or not.
                            if (expirationDateResponse !== null && expirationDateResponse !== undefined &&
                                !expirationDateResponse.errorMessage && !expirationDateResponse.errorType &&
                                expirationDateResponse.data && expirationDateResponse.data.length !== 0) {
                                // 3) Call the updateCard Moonbeam AppSync API, to update the expiration date for each card
                                const updatedDetailsResponse = await moonbeamClient.updateCardDetails({
                                    cardId: cardId,
                                    id: linkedUser.id,
                                    memberId: linkedUser.memberId,
                                    expirationDate: expirationDateResponse.data
                                });
                                // check to see if the update details call was successful or not.
                                if (updatedDetailsResponse !== null && updatedDetailsResponse !== undefined &&
                                    !updatedDetailsResponse.errorMessage && !updatedDetailsResponse.errorType &&
                                    updatedDetailsResponse.data) {
                                    // do nothing here but log a successfully updated card
                                    console.log(`Card ${cardId} successfully updated!`);
                                }
                                else {
                                    /**
                                     * do not stop updating the other cards' expiration dates, just take note of what has not been
                                     * updated successfully
                                     */
                                    failedUpdates.push(`${linkedUser.id} | ${linkedUser.memberId} | ${cardId}`);
                                }
                            }
                            else {
                                /**
                                 * do not stop updating the other cards' expiration dates, just take note of what has not been
                                 * updated successfully
                                 */
                                failedUpdates.push(`${linkedUser.id} | ${linkedUser.memberId} | ${cardId}`);
                            }
                        }
                    }
                }
            }
            // print all the failed updates accordingly
            if (failedUpdates.length !== 0) {
                console.log(`------------------FAILED CARD UPDATES------------------`);
                failedUpdates.forEach(failedUpdate => {
                    console.log(`${failedUpdate}\n`);
                });
                console.log(`-------------------------------------------------------`);
            }
            else {
                console.log(`All cards successfully updated!`);
            }
        }
        else {
            /**
             * no need for further actions, since this error will be logged and nothing will execute further.
             * in the future we might need some alerts and metrics emitting here.
             */
            console.log(`Linked users retrieval through GET linked users call failed`);
        }
    }
    catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here.
         */
        console.log(`Unexpected error while processing the card expiration back-fill cron event ${error}`);
    }
};
exports.triggerCardExpirationBackFill = triggerCardExpirationBackFill;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyZEV4cGlyYXRpb25CYWNrZmlsbFRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DYXJkRXhwaXJhdGlvbkJhY2tmaWxsVHJpZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBd0g7QUFFeEg7Ozs7OztHQU1HO0FBQ0ksTUFBTSw2QkFBNkIsR0FBRyxLQUFLLElBQW1CLEVBQUU7SUFDbkUsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7Ozs7OztXQWFHO1FBQ0gsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVuRSxtRUFBbUU7UUFDbkUsTUFBTSxtQkFBbUIsR0FBZ0MsTUFBTSxjQUFjLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUV2RywyRUFBMkU7UUFDM0UsSUFBSSxtQkFBbUIsS0FBSyxJQUFJLElBQUksbUJBQW1CLEtBQUssU0FBUyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWTtlQUNuRyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDeEcsTUFBTSxhQUFhLEdBQWEsRUFBRSxDQUFDO1lBRW5DLEtBQUssTUFBTSxVQUFVLElBQUksbUJBQW1CLENBQUMsSUFBSSxFQUFFO2dCQUMvQyx3RUFBd0U7Z0JBQ3hFLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtvQkFDckIsS0FBSyxNQUFNLE1BQU0sSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO3dCQUNyQyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7NEJBQ2pCLHNGQUFzRjs0QkFDdEYsTUFBTSxzQkFBc0IsR0FBd0IsTUFBTSxXQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUU3RixtRUFBbUU7NEJBQ25FLElBQUksc0JBQXNCLEtBQUssSUFBSSxJQUFJLHNCQUFzQixLQUFLLFNBQVM7Z0NBQ3ZFLENBQUMsc0JBQXNCLENBQUMsWUFBWSxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUztnQ0FDekUsc0JBQXNCLENBQUMsSUFBSSxJQUFJLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dDQUV6RSwyRkFBMkY7Z0NBQzNGLE1BQU0sc0JBQXNCLEdBQWdDLE1BQU0sY0FBYyxDQUFDLGlCQUFpQixDQUFDO29DQUMvRixNQUFNLEVBQUUsTUFBTTtvQ0FDZCxFQUFFLEVBQUUsVUFBVSxDQUFDLEVBQUU7b0NBQ2pCLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtvQ0FDN0IsY0FBYyxFQUFFLHNCQUFzQixDQUFDLElBQUk7aUNBQzlDLENBQUMsQ0FBQztnQ0FFSCxpRUFBaUU7Z0NBQ2pFLElBQUksc0JBQXNCLEtBQUssSUFBSSxJQUFJLHNCQUFzQixLQUFLLFNBQVM7b0NBQ3ZFLENBQUMsc0JBQXNCLENBQUMsWUFBWSxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUztvQ0FDekUsc0JBQXNCLENBQUMsSUFBSSxFQUFFO29DQUM3QixzREFBc0Q7b0NBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxNQUFNLHdCQUF3QixDQUFDLENBQUM7aUNBQ3ZEO3FDQUFNO29DQUNIOzs7dUNBR0c7b0NBQ0gsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxFQUFFLE1BQU0sVUFBVSxDQUFDLFFBQVEsTUFBTSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lDQUMvRTs2QkFDSjtpQ0FBTTtnQ0FDSDs7O21DQUdHO2dDQUNILGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRSxNQUFNLFVBQVUsQ0FBQyxRQUFRLE1BQU0sTUFBTSxFQUFFLENBQUMsQ0FBQzs2QkFDL0U7eUJBQ0o7cUJBQ0o7aUJBQ0o7YUFDSjtZQUVELDJDQUEyQztZQUMzQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7Z0JBQ3ZFLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksQ0FBQyxDQUFDO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7YUFDMUU7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2FBQ2xEO1NBQ0o7YUFBTTtZQUNIOzs7ZUFHRztZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQztTQUM5RTtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWjs7O1dBR0c7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDhFQUE4RSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3RHO0FBQ0wsQ0FBQyxDQUFBO0FBcEdZLFFBQUEsNkJBQTZCLGlDQW9HekMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0VsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSwgTW9vbmJlYW1DbGllbnQsIE9saXZlQ2xpZW50LCBDYXJkRGV0YWlsc1Jlc3BvbnNlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gaGFuZGxlIHRoZSBiYWNrLWZpbGwgb2YgdGhlIGFsbCB0aGUgY2FyZHMnXG4gKiBleHBpcmF0aW9uIGRhdGVzLlxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayB2b2lkfSwgc2luY2UgdGhlIEV2ZW50QnJpZGdlclxuICogZXZlbnQgdHJpZ2dlciwgd2lsbCBleGVjdXRlIGEgY3JvbiBqb2IgYW5kIG5vdCByZXR1cm4gYW55dGhpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCB0cmlnZ2VyQ2FyZEV4cGlyYXRpb25CYWNrRmlsbCA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG92ZXJhbGwgY2FyZCBleHBpcmF0aW9uIGRhdGEgYmFjay1maWxsIGNyb24gdHJpZ2dlcmluZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAqXG4gICAgICAgICAqIDEpIENhbGwgdGhlIGdldEVsaWdpYmxlTGlua2VkVXNlcnMgTW9vbmJlYW0gQXBwU3luYyBBUEksIGluIG9yZGVyIHRvIGdldCBhbGwgdGhlIHVzZXJzIHdoaWNoIGhhdmVcbiAgICAgICAgICogbGlua2VkIGNhcmRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiAyKSBGb3IgZWFjaCB1c2VyLCBsb29wIHRocm91Z2ggdGhlaXIgbGlua2VkIGNhcmRzICh1cCB0byAzIGF0IHRoZSBtb21lbnQpLCBhbmQgY2FsbCB0aGUgZ2V0Q2FyZERldGFpbHNcbiAgICAgICAgICogT2xpdmUgQVBJLCBpbiBvcmRlciB0byByZXRyaWV2ZSB0aGUgY2FyZCdzIGV4cGlyYXRpb24gZGF0ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogMykgQ2FsbCB0aGUgdXBkYXRlQ2FyZCBNb29uYmVhbSBBcHBTeW5jIEFQSSwgaW4gb3JkZXIgdG8gdXBkYXRlIHRoZSBleHBpcmF0aW9uIGRhdGUgZm9yIGVhY2ggb25lIG9mIHRob3NlXG4gICAgICAgICAqIGNhcmRzIGludGVybmFsbHkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEZpcnN0IGluaXRpYWxpemUgYWxsIHRoZSBjbGllbnRzIHRoYXQgd2Ugd2lsbCBuZWVkIGluIG9yZGVyIHRvIG1ha2UgdGhlc2UgQVBJIGNhbGxzXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAvLyAxKSBDYWxsIHRoZSBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50XG4gICAgICAgIGNvbnN0IGxpbmtlZFVzZXJzUmVzcG9uc2U6IEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmdldEVsaWdpYmxlTGlua2VkVXNlcnMoKTtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGdldCBlbGlnaWJsZSBsaW5rZWQgdXNlciBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgICAgaWYgKGxpbmtlZFVzZXJzUmVzcG9uc2UgIT09IG51bGwgJiYgbGlua2VkVXNlcnNSZXNwb25zZSAhPT0gdW5kZWZpbmVkICYmICFsaW5rZWRVc2Vyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZVxuICAgICAgICAgICAgJiYgIWxpbmtlZFVzZXJzUmVzcG9uc2UuZXJyb3JUeXBlICYmIGxpbmtlZFVzZXJzUmVzcG9uc2UuZGF0YSAmJiBsaW5rZWRVc2Vyc1Jlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBmYWlsZWRVcGRhdGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmtlZFVzZXIgb2YgbGlua2VkVXNlcnNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgd2UgaGF2ZSBhcHByb3ByaWF0ZWx5IGZvcm1hdHRlZCByZXRyaWV2ZWQgbGlua2VkIHVzZXJzXG4gICAgICAgICAgICAgICAgaWYgKGxpbmtlZFVzZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjYXJkSWQgb2YgbGlua2VkVXNlci5jYXJkSWRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZElkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsbCB0aGUgZ2V0Q2FyZERldGFpbHMgT2xpdmUgQVBJLCBpbiBvcmRlciB0byByZXRyaWV2ZSB0aGUgY2FyZCdzIGV4cGlyYXRpb24gZGF0ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBpcmF0aW9uRGF0ZVJlc3BvbnNlOiBDYXJkRGV0YWlsc1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0Q2FyZERldGFpbHMoY2FyZElkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZ2V0IGNhcmQgZGV0YWlscyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhwaXJhdGlvbkRhdGVSZXNwb25zZSAhPT0gbnVsbCAmJiBleHBpcmF0aW9uRGF0ZVJlc3BvbnNlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWV4cGlyYXRpb25EYXRlUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFleHBpcmF0aW9uRGF0ZVJlc3BvbnNlLmVycm9yVHlwZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBpcmF0aW9uRGF0ZVJlc3BvbnNlLmRhdGEgJiYgZXhwaXJhdGlvbkRhdGVSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMpIENhbGwgdGhlIHVwZGF0ZUNhcmQgTW9vbmJlYW0gQXBwU3luYyBBUEksIHRvIHVwZGF0ZSB0aGUgZXhwaXJhdGlvbiBkYXRlIGZvciBlYWNoIGNhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZERldGFpbHNSZXNwb25zZTogRWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQudXBkYXRlQ2FyZERldGFpbHMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZElkOiBjYXJkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbGlua2VkVXNlci5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBsaW5rZWRVc2VyLm1lbWJlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvbkRhdGU6IGV4cGlyYXRpb25EYXRlUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZSBkZXRhaWxzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlZERldGFpbHNSZXNwb25zZSAhPT0gbnVsbCAmJiB1cGRhdGVkRGV0YWlsc1Jlc3BvbnNlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICF1cGRhdGVkRGV0YWlsc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhdXBkYXRlZERldGFpbHNSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWREZXRhaWxzUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG8gbm90aGluZyBoZXJlIGJ1dCBsb2cgYSBzdWNjZXNzZnVsbHkgdXBkYXRlZCBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2FyZCAke2NhcmRJZH0gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQhYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGRvIG5vdCBzdG9wIHVwZGF0aW5nIHRoZSBvdGhlciBjYXJkcycgZXhwaXJhdGlvbiBkYXRlcywganVzdCB0YWtlIG5vdGUgb2Ygd2hhdCBoYXMgbm90IGJlZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZFVwZGF0ZXMucHVzaChgJHtsaW5rZWRVc2VyLmlkfSB8ICR7bGlua2VkVXNlci5tZW1iZXJJZH0gfCAke2NhcmRJZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBkbyBub3Qgc3RvcCB1cGRhdGluZyB0aGUgb3RoZXIgY2FyZHMnIGV4cGlyYXRpb24gZGF0ZXMsIGp1c3QgdGFrZSBub3RlIG9mIHdoYXQgaGFzIG5vdCBiZWVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWRVcGRhdGVzLnB1c2goYCR7bGlua2VkVXNlci5pZH0gfCAke2xpbmtlZFVzZXIubWVtYmVySWR9IHwgJHtjYXJkSWR9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwcmludCBhbGwgdGhlIGZhaWxlZCB1cGRhdGVzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBpZiAoZmFpbGVkVXBkYXRlcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgLS0tLS0tLS0tLS0tLS0tLS0tRkFJTEVEIENBUkQgVVBEQVRFUy0tLS0tLS0tLS0tLS0tLS0tLWApO1xuICAgICAgICAgICAgICAgIGZhaWxlZFVwZGF0ZXMuZm9yRWFjaChmYWlsZWRVcGRhdGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtmYWlsZWRVcGRhdGV9XFxuYCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEFsbCBjYXJkcyBzdWNjZXNzZnVsbHkgdXBkYXRlZCFgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMaW5rZWQgdXNlcnMgcmV0cmlldmFsIHRocm91Z2ggR0VUIGxpbmtlZCB1c2VycyBjYWxsIGZhaWxlZGApO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmUuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHRoZSBjYXJkIGV4cGlyYXRpb24gYmFjay1maWxsIGNyb24gZXZlbnQgJHtlcnJvcn1gKTtcbiAgICB9XG59XG4iXX0=