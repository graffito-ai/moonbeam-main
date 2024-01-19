"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeasonalOffers = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetSeasonalOffers resolver - used mainly for returning seasonal nearby,
 * as well as seasonal online offers.
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
const getSeasonalOffers = async (fieldName, getOffersInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // check if a valid filter is passed in
        if (getOffersInput.filterType !== moonbeam_models_1.OfferFilter.SeasonalNearby && getOffersInput.filterType !== moonbeam_models_1.OfferFilter.SeasonalOnline) {
            const errorMessage = `Unsupported filter for seasonal offers query filter ${getOffersInput.filterType}. Use getFidelisPartners, getOffers or getPremierOffers instead.`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.OffersErrorType.ValidationError
            };
        }
        else {
            // check if valid information is passed in
            if (getOffersInput.filterType === moonbeam_models_1.OfferFilter.SeasonalNearby
                && (!getOffersInput.radius || !getOffersInput.radiusLatitude || !getOffersInput.radiusLongitude || getOffersInput.radiusIncludeOnlineStores === undefined)) {
                const errorMessage = `Invalid information passed in for offers query filter ${getOffersInput.filterType}.`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.OffersErrorType.ValidationError
                };
            }
            else {
                if (getOffersInput.offerSeasonalType === null || getOffersInput.offerSeasonalType === undefined) {
                    const errorMessage = `No offer seasonal type passed in for filter ${getOffersInput.filterType}.`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.OffersErrorType.ValidationError
                    };
                }
                else {
                    // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
                    const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
                    // execute the GET offers Olive REST call
                    const offersResponse = await oliveClient.getOffers(getOffersInput);
                    // check to see if the offers call was executed successfully
                    if (offersResponse && !offersResponse.errorMessage && !offersResponse.errorType && offersResponse.data &&
                        offersResponse.data.totalNumberOfPages !== undefined && offersResponse.data.totalNumberOfRecords !== undefined &&
                        offersResponse.data.offers !== undefined) {
                        /**
                         * Todo: Remove this once the front-end is changed. Olive changed the type of the reward type for their enum so we're going to patch
                         * this so we match with whatever we had this on the front-end before they made this breaking change.
                         */
                        offersResponse.data.offers.forEach(retrievedOffer => {
                            if (retrievedOffer !== undefined && retrievedOffer !== null &&
                                retrievedOffer.reward !== undefined && retrievedOffer.reward !== null &&
                                retrievedOffer.reward.type !== undefined && retrievedOffer.reward.type !== null) {
                                /**
                                 * switch Fixed to RewardAmount and
                                 * switch Percentage to RewardPercentage
                                 */
                                if (retrievedOffer.reward.type === moonbeam_models_1.RewardType.Percentage) {
                                    retrievedOffer.reward.type = moonbeam_models_1.RewardType.RewardPercent;
                                }
                                if (retrievedOffer.reward.type === moonbeam_models_1.RewardType.Fixed) {
                                    retrievedOffer.reward.type = moonbeam_models_1.RewardType.RewardAmount;
                                }
                            }
                        });
                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        };
                    }
                    else {
                        const errorMessage = `Unexpected response structure returned from the get seasonal offers call ${JSON.stringify(offersResponse)}!`;
                        console.log(errorMessage);
                        // if there are errors associated with the call, just return the error message and error type from the upstream client
                        return {
                            errorType: moonbeam_models_1.OffersErrorType.ValidationError,
                            errorMessage: errorMessage
                        };
                    }
                }
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.OffersErrorType.UnexpectedError
        };
    }
};
exports.getSeasonalOffers = getSeasonalOffers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0U2Vhc29uYWxPZmZlcnNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFNlYXNvbmFsT2ZmZXJzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBT21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGNBQThCLEVBQTJCLEVBQUU7SUFDbEgsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyx1Q0FBdUM7UUFDdkMsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsY0FBYyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDdEgsTUFBTSxZQUFZLEdBQUcsdURBQXVELGNBQWMsQ0FBQyxVQUFVLGtFQUFrRSxDQUFDO1lBQ3hLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTthQUM3QyxDQUFBO1NBQ0o7YUFBTTtZQUNILDBDQUEwQztZQUMxQyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxjQUFjO21CQUNyRCxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxJQUFJLGNBQWMsQ0FBQyx5QkFBeUIsS0FBSyxTQUFTLENBQUMsRUFBRTtnQkFDNUosTUFBTSxZQUFZLEdBQUcseURBQXlELGNBQWMsQ0FBQyxVQUFVLEdBQUcsQ0FBQztnQkFDM0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFF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LGVBQWU7U0FDN0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBN0ZZLFFBQUEsaUJBQWlCLHFCQTZGN0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEdldE9mZmVyc0lucHV0LFxuICAgIE9mZmVyRmlsdGVyLFxuICAgIE9mZmVyc0Vycm9yVHlwZSxcbiAgICBPZmZlcnNSZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudCxcbiAgICBSZXdhcmRUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0U2Vhc29uYWxPZmZlcnMgcmVzb2x2ZXIgLSB1c2VkIG1haW5seSBmb3IgcmV0dXJuaW5nIHNlYXNvbmFsIG5lYXJieSxcbiAqIGFzIHdlbGwgYXMgc2Vhc29uYWwgb25saW5lIG9mZmVycy5cbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldE9mZmVyc0lucHV0IG9mZmVycyBpbnB1dCB1c2VkIGZvciB0aGUgb2ZmZXJzIG9iamVjdHMgdG8gYmUgcmV0cmlldmVkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE9mZmVyc1Jlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0U2Vhc29uYWxPZmZlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCk6IFByb21pc2U8T2ZmZXJzUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBjaGVjayBpZiBhIHZhbGlkIGZpbHRlciBpcyBwYXNzZWQgaW5cbiAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLlNlYXNvbmFsTmVhcmJ5ICYmIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLlNlYXNvbmFsT25saW5lKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgZmlsdGVyIGZvciBzZWFzb25hbCBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uIFVzZSBnZXRGaWRlbGlzUGFydG5lcnMsIGdldE9mZmVycyBvciBnZXRQcmVtaWVyT2ZmZXJzIGluc3RlYWQuYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB2YWxpZCBpbmZvcm1hdGlvbiBpcyBwYXNzZWQgaW5cbiAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5TZWFzb25hbE5lYXJieVxuICAgICAgICAgICAgICAgICYmICghZ2V0T2ZmZXJzSW5wdXQucmFkaXVzIHx8ICFnZXRPZmZlcnNJbnB1dC5yYWRpdXNMYXRpdHVkZSB8fCAhZ2V0T2ZmZXJzSW5wdXQucmFkaXVzTG9uZ2l0dWRlIHx8IGdldE9mZmVyc0lucHV0LnJhZGl1c0luY2x1ZGVPbmxpbmVTdG9yZXMgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4gZm9yIG9mZmVycyBxdWVyeSBmaWx0ZXIgJHtnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlfS5gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0T2ZmZXJzSW5wdXQub2ZmZXJTZWFzb25hbFR5cGUgPT09IG51bGwgfHwgZ2V0T2ZmZXJzSW5wdXQub2ZmZXJTZWFzb25hbFR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gb2ZmZXIgc2Vhc29uYWwgdHlwZSBwYXNzZWQgaW4gZm9yIGZpbHRlciAke2dldE9mZmVyc0lucHV0LmZpbHRlclR5cGV9LmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBHRVQgb2ZmZXJzIE9saXZlIFJFU1QgY2FsbFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvZmZlcnNSZXNwb25zZTogT2ZmZXJzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRPZmZlcnMoZ2V0T2ZmZXJzSW5wdXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgb2ZmZXJzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgICAgICBpZiAob2ZmZXJzUmVzcG9uc2UgJiYgIW9mZmVyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhb2ZmZXJzUmVzcG9uc2UuZXJyb3JUeXBlICYmIG9mZmVyc1Jlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlBhZ2VzICE9PSB1bmRlZmluZWQgJiYgb2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVG9kbzogUmVtb3ZlIHRoaXMgb25jZSB0aGUgZnJvbnQtZW5kIGlzIGNoYW5nZWQuIE9saXZlIGNoYW5nZWQgdGhlIHR5cGUgb2YgdGhlIHJld2FyZCB0eXBlIGZvciB0aGVpciBlbnVtIHNvIHdlJ3JlIGdvaW5nIHRvIHBhdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGlzIHNvIHdlIG1hdGNoIHdpdGggd2hhdGV2ZXIgd2UgaGFkIHRoaXMgb24gdGhlIGZyb250LWVuZCBiZWZvcmUgdGhleSBtYWRlIHRoaXMgYnJlYWtpbmcgY2hhbmdlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycy5mb3JFYWNoKHJldHJpZXZlZE9mZmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkT2ZmZXIgIT09IHVuZGVmaW5lZCAmJiByZXRyaWV2ZWRPZmZlciAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQgIT09IHVuZGVmaW5lZCAmJiByZXRyaWV2ZWRPZmZlci5yZXdhcmQgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBzd2l0Y2ggRml4ZWQgdG8gUmV3YXJkQW1vdW50IGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBzd2l0Y2ggUGVyY2VudGFnZSB0byBSZXdhcmRQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9PT0gUmV3YXJkVHlwZS5QZXJjZW50YWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID0gUmV3YXJkVHlwZS5SZXdhcmRQZXJjZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID09PSBSZXdhcmRUeXBlLkZpeGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID0gUmV3YXJkVHlwZS5SZXdhcmRBbW91bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGdldCBzZWFzb25hbCBvZmZlcnMgY2FsbCAke0pTT04uc3RyaW5naWZ5KG9mZmVyc1Jlc3BvbnNlKX0hYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==