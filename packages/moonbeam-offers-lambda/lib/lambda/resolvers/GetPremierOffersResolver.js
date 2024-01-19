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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UHJlbWllck9mZmVyc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0UHJlbWllck9mZmVyc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVNtQztBQUVuQzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxjQUE4QixFQUEyQixFQUFFO0lBQ2pILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsdUNBQXVDO1FBQ3ZDLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLGFBQWEsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsYUFBYSxFQUFFO1lBQ3BILE1BQU0sWUFBWSxHQUFHLHNEQUFzRCxjQUFjLENBQUMsVUFBVSxtRUFBbUUsQ0FBQztZQUN4SyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxpQ0FBZSxDQUFDLGVBQWU7YUFDN0MsQ0FBQTtTQUNKO2FBQU07WUFDSCwwQ0FBMEM7WUFDMUMsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsYUFBYTttQkFDcEQsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxjQUFjLENBQUMseUJBQXlCLEtBQUssU0FBUyxDQUFDLEVBQUU7Z0JBQzVKLE1BQU0sWUFBWSxHQUFHLHlEQUF5RCxjQUFjLENBQUMsVUFBVSxHQUFHLENBQUM7Z0JBQzNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFC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c291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBHZXRPZmZlcnNJbnB1dCxcbiAgICBPZmZlcixcbiAgICBPZmZlckZpbHRlcixcbiAgICBPZmZlcnNFcnJvclR5cGUsXG4gICAgT2ZmZXJzUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnQsIFByZW1pZXJDbGlja09ubGluZU9mZmVyT3JkZXIsXG4gICAgUHJlbWllck9ubGluZU9mZmVyT3JkZXIsXG4gICAgUmVkZW1wdGlvblR5cGUsIFJld2FyZFR5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRQcmVtaWVyT2ZmZXJzIHJlc29sdmVyIC0gdXNlZCBtYWlubHkgZm9yIHJldHVybmluZyBwcmVtaWVyIG5lYXJieSxcbiAqIGFzIHdlbGwgYXMgcHJlbWllciBvbmxpbmUgb2ZmZXJzXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRPZmZlcnNJbnB1dCBvZmZlcnMgaW5wdXQgdXNlZCBmb3IgdGhlIG9mZmVycyBvYmplY3RzIHRvIGJlIHJldHJpZXZlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBPZmZlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFByZW1pZXJPZmZlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCk6IFByb21pc2U8T2ZmZXJzUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBjaGVjayBpZiBhIHZhbGlkIGZpbHRlciBpcyBwYXNzZWQgaW5cbiAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLlByZW1pZXJOZWFyYnkgJiYgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSAhPT0gT2ZmZXJGaWx0ZXIuUHJlbWllck9ubGluZSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIGZpbHRlciBmb3IgcHJlbWllciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uIFVzZSBnZXRGaWRlbGlzUGFydG5lcnMsIGdldE9mZmVycyBvciBnZXRTZWFzb25hbE9mZmVycyBpbnN0ZWFkLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdmFsaWQgaW5mb3JtYXRpb24gaXMgcGFzc2VkIGluXG4gICAgICAgICAgICBpZiAoZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuUHJlbWllck5lYXJieVxuICAgICAgICAgICAgICAgICYmICghZ2V0T2ZmZXJzSW5wdXQucmFkaXVzIHx8ICFnZXRPZmZlcnNJbnB1dC5yYWRpdXNMYXRpdHVkZSB8fCAhZ2V0T2ZmZXJzSW5wdXQucmFkaXVzTG9uZ2l0dWRlIHx8IGdldE9mZmVyc0lucHV0LnJhZGl1c0luY2x1ZGVPbmxpbmVTdG9yZXMgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4gZm9yIG9mZmVycyBxdWVyeSBmaWx0ZXIgJHtnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlfS5gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgR0VUIG9mZmVycyBPbGl2ZSBSRVNUIGNhbGxcbiAgICAgICAgICAgICAgICBjb25zdCBvZmZlcnNSZXNwb25zZTogT2ZmZXJzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRPZmZlcnMoZ2V0T2ZmZXJzSW5wdXQpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBvZmZlcnMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgaWYgKG9mZmVyc1Jlc3BvbnNlICYmICFvZmZlcnNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIW9mZmVyc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBvZmZlcnNSZXNwb25zZS5kYXRhICYmXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlBhZ2VzICE9PSB1bmRlZmluZWQgJiYgb2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVG9kbzogUmVtb3ZlIHRoaXMgb25jZSB0aGUgZnJvbnQtZW5kIGlzIGNoYW5nZWQuIE9saXZlIGNoYW5nZWQgdGhlIHR5cGUgb2YgdGhlIHJld2FyZCB0eXBlIGZvciB0aGVpciBlbnVtIHNvIHdlJ3JlIGdvaW5nIHRvIHBhdGNoXG4gICAgICAgICAgICAgICAgICAgICAqIHRoaXMgc28gd2UgbWF0Y2ggd2l0aCB3aGF0ZXZlciB3ZSBoYWQgdGhpcyBvbiB0aGUgZnJvbnQtZW5kIGJlZm9yZSB0aGV5IG1hZGUgdGhpcyBicmVha2luZyBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycy5mb3JFYWNoKHJldHJpZXZlZE9mZmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRPZmZlciAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIucmV3YXJkICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogc3dpdGNoIEZpeGVkIHRvIFJld2FyZEFtb3VudCBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBzd2l0Y2ggUGVyY2VudGFnZSB0byBSZXdhcmRQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPT09IFJld2FyZFR5cGUuUGVyY2VudGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID0gUmV3YXJkVHlwZS5SZXdhcmRQZXJjZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9PT0gUmV3YXJkVHlwZS5GaXhlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID0gUmV3YXJkVHlwZS5SZXdhcmRBbW91bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgdGhlIG9ubGluZSBvZmZlcnMgYWNjb3JkaW5nIHRvIGhvdyB3ZSB3YW50IHRoZW0gZGlzcGxheWVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5QcmVtaWVyT25saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzb3J0IHRoZSByZWd1bGFyIG9ubGluZSBhbmQvb3IgdGhlIGNsaWNrLWJhc2VkIG9ubGluZSBvZmZlcnMgaG93IHdlIHdhbnQgdGhlbSBkaXNwbGF5ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZW1pZXJPbmxpbmVPZmZlcnNPcmRlcjogc3RyaW5nW10gPSBnZXRPZmZlcnNJbnB1dC5yZWRlbXB0aW9uVHlwZSA9PT0gUmVkZW1wdGlvblR5cGUuQ2xpY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFByZW1pZXJDbGlja09ubGluZU9mZmVyT3JkZXIgOiBQcmVtaWVyT25saW5lT2ZmZXJPcmRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmVtaWVyT25saW5lU29ydGVkTWFwOiBNYXA8bnVtYmVyLCBPZmZlcj4gPSBuZXcgTWFwPG51bWJlciwgT2ZmZXI+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycy5mb3JFYWNoKG9mZmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnaXZlIGEgd2VpZ2h0IHRvIHRoZSBicmFuZCBEQkEgZGVwZW5kaW5nIG9uIGhvdyB3ZSB3YW50IHRoZW0gdG8gc2hvdyB1cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyICE9PSB1bmRlZmluZWQgJiYgb2ZmZXIgIT09IG51bGwgJiYgb2ZmZXIhLmJyYW5kRGJhICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZlciEuYnJhbmREYmEgIT09IG51bGwgJiYgcHJlbWllck9ubGluZU9mZmVyc09yZGVyLmluY2x1ZGVzKG9mZmVyIS5icmFuZERiYSEudHJpbVN0YXJ0KCkudHJpbUVuZCgpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZW1pZXJPbmxpbmVTb3J0ZWRNYXAuc2V0KHByZW1pZXJPbmxpbmVPZmZlcnNPcmRlci5pbmRleE9mKG9mZmVyIS5icmFuZERiYSEudHJpbVN0YXJ0KCkudHJpbUVuZCgpKSwgb2ZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVtaWVyT25saW5lU29ydGVkTWFwID0gbmV3IE1hcChbLi4ucHJlbWllck9ubGluZVNvcnRlZE1hcF0uc29ydCgoYSwgYikgPT4gYVswXSAtIGJbMF0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSByZXNwb25zZSdzIG9mZmVycywgdG8gdGhlIHNvcnRlZCBvZmZlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvcnRlZE9mZmVyczogT2ZmZXJbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlbWllck9ubGluZVNvcnRlZE1hcC5mb3JFYWNoKChvZmZlciwgXykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlZE9mZmVycy5wdXNoKG9mZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMgPSBzb3J0ZWRPZmZlcnM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIHJlc3BvbnNlIGRhdGEgd2l0aCB0aGUgYXBwcm9wcmlhdGUgb2ZmZXJzIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyc1Jlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIHJlc3BvbnNlIGRhdGEgd2l0aCB0aGUgYXBwcm9wcmlhdGUgb2ZmZXJzIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyc1Jlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBnZXQgcHJlbWllciBvZmZlcnMgY2FsbCAke0pTT04uc3RyaW5naWZ5KG9mZmVyc1Jlc3BvbnNlKX0hYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=