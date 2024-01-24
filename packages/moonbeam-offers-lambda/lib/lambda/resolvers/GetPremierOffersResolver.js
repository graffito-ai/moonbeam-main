"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPremierOffers = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetPremierOffers resolver - used mainly for returning premier nearby,
 * as well as premier online offers
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
const getPremierOffers = async (fieldName, getOffersInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // check if a valid filter is passed in
        if (getOffersInput.filterType !== moonbeam_models_1.OfferFilter.PremierNearby && getOffersInput.filterType !== moonbeam_models_1.OfferFilter.PremierOnline) {
            const errorMessage = `Unsupported filter for premier offers query filter ${getOffersInput.filterType}. Use getFidelisPartners, getOffers or getSeasonalOffers instead.`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.OffersErrorType.ValidationError
            };
        }
        else {
            // check if valid information is passed in
            if (getOffersInput.filterType === moonbeam_models_1.OfferFilter.PremierNearby
                && (!getOffersInput.radius || !getOffersInput.radiusLatitude || !getOffersInput.radiusLongitude || getOffersInput.radiusIncludeOnlineStores === undefined)) {
                const errorMessage = `Invalid information passed in for offers query filter ${getOffersInput.filterType}.`;
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
                const offersResponse = await oliveClient.getOffers(getOffersInput, 3);
                // check to see if the offers call was executed successfully
                if (offersResponse && !offersResponse.errorMessage && !offersResponse.errorType && offersResponse.data &&
                    offersResponse.data.totalNumberOfPages !== undefined && offersResponse.data.totalNumberOfRecords !== undefined) {
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
                    // filter the online offers according to how we want them displayed
                    if (getOffersInput.filterType === moonbeam_models_1.OfferFilter.PremierOnline) {
                        // sort the regular online and/or the click-based online offers how we want them displayed
                        const premierOnlineOffersOrder = getOffersInput.redemptionType === moonbeam_models_1.RedemptionType.Click
                            ? moonbeam_models_1.PremierClickOnlineOfferOrder : moonbeam_models_1.PremierOnlineOfferOrder;
                        let premierOnlineSortedMap = new Map();
                        offersResponse.data.offers.forEach(offer => {
                            // give a weight to the brand DBA depending on how we want them to show up
                            offer !== undefined && offer !== null && offer.brandDba !== undefined &&
                                offer.brandDba !== null && premierOnlineOffersOrder.includes(offer.brandDba.trimStart().trimEnd()) &&
                                premierOnlineSortedMap.set(premierOnlineOffersOrder.indexOf(offer.brandDba.trimStart().trimEnd()), offer);
                        });
                        premierOnlineSortedMap = new Map([...premierOnlineSortedMap].sort((a, b) => a[0] - b[0]));
                        // set the response's offers, to the sorted offers
                        const sortedOffers = [];
                        premierOnlineSortedMap.forEach((offer, _) => {
                            sortedOffers.push(offer);
                        });
                        offersResponse.data.offers = sortedOffers;
                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        };
                    }
                    else {
                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        };
                    }
                }
                else {
                    const errorMessage = `Unexpected response structure returned from the get premier offers call ${JSON.stringify(offersResponse)}!`;
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
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.OffersErrorType.UnexpectedError
        };
    }
};
exports.getPremierOffers = getPremierOffers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UHJlbWllck9mZmVyc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0UHJlbWllck9mZmVyc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVNtQztBQUVuQzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxjQUE4QixFQUEyQixFQUFFO0lBQ2pILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsdUNBQXVDO1FBQ3ZDLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLGFBQWEsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsYUFBYSxFQUFFO1lBQ3BILE1BQU0sWUFBWSxHQUFHLHNEQUFzRCxjQUFjLENBQUMsVUFBVSxtRUFBbUUsQ0FBQztZQUN4SyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxpQ0FBZSxDQUFDLGVBQWU7YUFDN0MsQ0FBQTtTQUNKO2FBQU07WUFDSCwwQ0FBMEM7WUFDMUMsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsYUFBYTttQkFDcEQsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxjQUFjLENBQUMseUJBQXlCLEtBQUssU0FBUyxDQUFDLEVBQUU7Z0JBQzVKLE1BQU0sWUFBWSxHQUFHLHlEQUF5RCxjQUFjLENBQUMsVUFBVSxHQUFHLENBQUM7Z0JBQzNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFC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R2V0T2ZmZXJzSW5wdXQsXG4gICAgT2ZmZXIsXG4gICAgT2ZmZXJGaWx0ZXIsXG4gICAgT2ZmZXJzRXJyb3JUeXBlLFxuICAgIE9mZmVyc1Jlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LCBQcmVtaWVyQ2xpY2tPbmxpbmVPZmZlck9yZGVyLFxuICAgIFByZW1pZXJPbmxpbmVPZmZlck9yZGVyLFxuICAgIFJlZGVtcHRpb25UeXBlLCBSZXdhcmRUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0UHJlbWllck9mZmVycyByZXNvbHZlciAtIHVzZWQgbWFpbmx5IGZvciByZXR1cm5pbmcgcHJlbWllciBuZWFyYnksXG4gKiBhcyB3ZWxsIGFzIHByZW1pZXIgb25saW5lIG9mZmVyc1xuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZ2V0T2ZmZXJzSW5wdXQgb2ZmZXJzIGlucHV0IHVzZWQgZm9yIHRoZSBvZmZlcnMgb2JqZWN0cyB0byBiZSByZXRyaWV2ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgT2ZmZXJzUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcmVtaWVyT2ZmZXJzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRPZmZlcnNJbnB1dDogR2V0T2ZmZXJzSW5wdXQpOiBQcm9taXNlPE9mZmVyc1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgYSB2YWxpZCBmaWx0ZXIgaXMgcGFzc2VkIGluXG4gICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlICE9PSBPZmZlckZpbHRlci5QcmVtaWVyTmVhcmJ5ICYmIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLlByZW1pZXJPbmxpbmUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbnN1cHBvcnRlZCBmaWx0ZXIgZm9yIHByZW1pZXIgb2ZmZXJzIHF1ZXJ5IGZpbHRlciAke2dldE9mZmVyc0lucHV0LmZpbHRlclR5cGV9LiBVc2UgZ2V0RmlkZWxpc1BhcnRuZXJzLCBnZXRPZmZlcnMgb3IgZ2V0U2Vhc29uYWxPZmZlcnMgaW5zdGVhZC5gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkIGluZm9ybWF0aW9uIGlzIHBhc3NlZCBpblxuICAgICAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLlByZW1pZXJOZWFyYnlcbiAgICAgICAgICAgICAgICAmJiAoIWdldE9mZmVyc0lucHV0LnJhZGl1cyB8fCAhZ2V0T2ZmZXJzSW5wdXQucmFkaXVzTGF0aXR1ZGUgfHwgIWdldE9mZmVyc0lucHV0LnJhZGl1c0xvbmdpdHVkZSB8fCBnZXRPZmZlcnNJbnB1dC5yYWRpdXNJbmNsdWRlT25saW5lU3RvcmVzID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluIGZvciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIEdFVCBvZmZlcnMgT2xpdmUgUkVTVCBjYWxsXG4gICAgICAgICAgICAgICAgY29uc3Qgb2ZmZXJzUmVzcG9uc2U6IE9mZmVyc1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0T2ZmZXJzKGdldE9mZmVyc0lucHV0LCAzKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgb2ZmZXJzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgIGlmIChvZmZlcnNSZXNwb25zZSAmJiAhb2ZmZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFvZmZlcnNSZXNwb25zZS5lcnJvclR5cGUgJiYgb2ZmZXJzUmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZQYWdlcyAhPT0gdW5kZWZpbmVkICYmIG9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlJlY29yZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVG9kbzogUmVtb3ZlIHRoaXMgb25jZSB0aGUgZnJvbnQtZW5kIGlzIGNoYW5nZWQuIE9saXZlIGNoYW5nZWQgdGhlIHR5cGUgb2YgdGhlIHJld2FyZCB0eXBlIGZvciB0aGVpciBlbnVtIHNvIHdlJ3JlIGdvaW5nIHRvIHBhdGNoXG4gICAgICAgICAgICAgICAgICAgICAqIHRoaXMgc28gd2UgbWF0Y2ggd2l0aCB3aGF0ZXZlciB3ZSBoYWQgdGhpcyBvbiB0aGUgZnJvbnQtZW5kIGJlZm9yZSB0aGV5IG1hZGUgdGhpcyBicmVha2luZyBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycy5mb3JFYWNoKHJldHJpZXZlZE9mZmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRPZmZlciAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIucmV3YXJkICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogc3dpdGNoIEZpeGVkIHRvIFJld2FyZEFtb3VudCBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBzd2l0Y2ggUGVyY2VudGFnZSB0byBSZXdhcmRQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPT09IFJld2FyZFR5cGUuUGVyY2VudGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID0gUmV3YXJkVHlwZS5SZXdhcmRQZXJjZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9PT0gUmV3YXJkVHlwZS5GaXhlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID0gUmV3YXJkVHlwZS5SZXdhcmRBbW91bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgdGhlIG9ubGluZSBvZmZlcnMgYWNjb3JkaW5nIHRvIGhvdyB3ZSB3YW50IHRoZW0gZGlzcGxheWVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5QcmVtaWVyT25saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzb3J0IHRoZSByZWd1bGFyIG9ubGluZSBhbmQvb3IgdGhlIGNsaWNrLWJhc2VkIG9ubGluZSBvZmZlcnMgaG93IHdlIHdhbnQgdGhlbSBkaXNwbGF5ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZW1pZXJPbmxpbmVPZmZlcnNPcmRlcjogc3RyaW5nW10gPSBnZXRPZmZlcnNJbnB1dC5yZWRlbXB0aW9uVHlwZSA9PT0gUmVkZW1wdGlvblR5cGUuQ2xpY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFByZW1pZXJDbGlja09ubGluZU9mZmVyT3JkZXIgOiBQcmVtaWVyT25saW5lT2ZmZXJPcmRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmVtaWVyT25saW5lU29ydGVkTWFwOiBNYXA8bnVtYmVyLCBPZmZlcj4gPSBuZXcgTWFwPG51bWJlciwgT2ZmZXI+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycy5mb3JFYWNoKG9mZmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnaXZlIGEgd2VpZ2h0IHRvIHRoZSBicmFuZCBEQkEgZGVwZW5kaW5nIG9uIGhvdyB3ZSB3YW50IHRoZW0gdG8gc2hvdyB1cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyICE9PSB1bmRlZmluZWQgJiYgb2ZmZXIgIT09IG51bGwgJiYgb2ZmZXIhLmJyYW5kRGJhICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZlciEuYnJhbmREYmEgIT09IG51bGwgJiYgcHJlbWllck9ubGluZU9mZmVyc09yZGVyLmluY2x1ZGVzKG9mZmVyIS5icmFuZERiYSEudHJpbVN0YXJ0KCkudHJpbUVuZCgpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZW1pZXJPbmxpbmVTb3J0ZWRNYXAuc2V0KHByZW1pZXJPbmxpbmVPZmZlcnNPcmRlci5pbmRleE9mKG9mZmVyIS5icmFuZERiYSEudHJpbVN0YXJ0KCkudHJpbUVuZCgpKSwgb2ZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVtaWVyT25saW5lU29ydGVkTWFwID0gbmV3IE1hcChbLi4ucHJlbWllck9ubGluZVNvcnRlZE1hcF0uc29ydCgoYSwgYikgPT4gYVswXSAtIGJbMF0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSByZXNwb25zZSdzIG9mZmVycywgdG8gdGhlIHNvcnRlZCBvZmZlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvcnRlZE9mZmVyczogT2ZmZXJbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlbWllck9ubGluZVNvcnRlZE1hcC5mb3JFYWNoKChvZmZlciwgXykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlZE9mZmVycy5wdXNoKG9mZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMgPSBzb3J0ZWRPZmZlcnM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIHJlc3BvbnNlIGRhdGEgd2l0aCB0aGUgYXBwcm9wcmlhdGUgb2ZmZXJzIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyc1Jlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIHJlc3BvbnNlIGRhdGEgd2l0aCB0aGUgYXBwcm9wcmlhdGUgb2ZmZXJzIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyc1Jlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBnZXQgcHJlbWllciBvZmZlcnMgY2FsbCAke0pTT04uc3RyaW5naWZ5KG9mZmVyc1Jlc3BvbnNlKX0hYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=