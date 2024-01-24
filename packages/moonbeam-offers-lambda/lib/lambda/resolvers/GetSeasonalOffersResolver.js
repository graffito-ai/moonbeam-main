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
                    const offersResponse = await oliveClient.getOffers(getOffersInput, 3);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0U2Vhc29uYWxPZmZlcnNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFNlYXNvbmFsT2ZmZXJzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBT21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGNBQThCLEVBQTJCLEVBQUU7SUFDbEgsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyx1Q0FBdUM7UUFDdkMsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsY0FBYyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDdEgsTUFBTSxZQUFZLEdBQUcsdURBQXVELGNBQWMsQ0FBQyxVQUFVLGtFQUFrRSxDQUFDO1lBQ3hLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTthQUM3QyxDQUFBO1NBQ0o7YUFBTTtZQUNILDBDQUEwQztZQUMxQyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxjQUFjO21CQUNyRCxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxJQUFJLGNBQWMsQ0FBQyx5QkFBeUIsS0FBSyxTQUFTLENBQUMsRUFBRTtnQkFDNUosTUFBTSxZQUFZLEdBQUcseURBQXlELGNBQWMsQ0FBQyxVQUFVLEdBQUcsQ0FBQztnQkFDM0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFF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aUNBQWUsQ0FBQyxlQUFlO1NBQzdDLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTdGWSxRQUFBLGlCQUFpQixxQkE2RjdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBHZXRPZmZlcnNJbnB1dCxcbiAgICBPZmZlckZpbHRlcixcbiAgICBPZmZlcnNFcnJvclR5cGUsXG4gICAgT2ZmZXJzUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgUmV3YXJkVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldFNlYXNvbmFsT2ZmZXJzIHJlc29sdmVyIC0gdXNlZCBtYWlubHkgZm9yIHJldHVybmluZyBzZWFzb25hbCBuZWFyYnksXG4gKiBhcyB3ZWxsIGFzIHNlYXNvbmFsIG9ubGluZSBvZmZlcnMuXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRPZmZlcnNJbnB1dCBvZmZlcnMgaW5wdXQgdXNlZCBmb3IgdGhlIG9mZmVycyBvYmplY3RzIHRvIGJlIHJldHJpZXZlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBPZmZlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNlYXNvbmFsT2ZmZXJzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRPZmZlcnNJbnB1dDogR2V0T2ZmZXJzSW5wdXQpOiBQcm9taXNlPE9mZmVyc1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgYSB2YWxpZCBmaWx0ZXIgaXMgcGFzc2VkIGluXG4gICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlICE9PSBPZmZlckZpbHRlci5TZWFzb25hbE5lYXJieSAmJiBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlICE9PSBPZmZlckZpbHRlci5TZWFzb25hbE9ubGluZSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIGZpbHRlciBmb3Igc2Vhc29uYWwgb2ZmZXJzIHF1ZXJ5IGZpbHRlciAke2dldE9mZmVyc0lucHV0LmZpbHRlclR5cGV9LiBVc2UgZ2V0RmlkZWxpc1BhcnRuZXJzLCBnZXRPZmZlcnMgb3IgZ2V0UHJlbWllck9mZmVycyBpbnN0ZWFkLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdmFsaWQgaW5mb3JtYXRpb24gaXMgcGFzc2VkIGluXG4gICAgICAgICAgICBpZiAoZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuU2Vhc29uYWxOZWFyYnlcbiAgICAgICAgICAgICAgICAmJiAoIWdldE9mZmVyc0lucHV0LnJhZGl1cyB8fCAhZ2V0T2ZmZXJzSW5wdXQucmFkaXVzTGF0aXR1ZGUgfHwgIWdldE9mZmVyc0lucHV0LnJhZGl1c0xvbmdpdHVkZSB8fCBnZXRPZmZlcnNJbnB1dC5yYWRpdXNJbmNsdWRlT25saW5lU3RvcmVzID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluIGZvciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0Lm9mZmVyU2Vhc29uYWxUeXBlID09PSBudWxsIHx8IGdldE9mZmVyc0lucHV0Lm9mZmVyU2Vhc29uYWxUeXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIG9mZmVyIHNlYXNvbmFsIHR5cGUgcGFzc2VkIGluIGZvciBmaWx0ZXIgJHtnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlfS5gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgR0VUIG9mZmVycyBPbGl2ZSBSRVNUIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2ZmZXJzUmVzcG9uc2U6IE9mZmVyc1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0T2ZmZXJzKGdldE9mZmVyc0lucHV0LCAzKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG9mZmVycyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZmVyc1Jlc3BvbnNlICYmICFvZmZlcnNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIW9mZmVyc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBvZmZlcnNSZXNwb25zZS5kYXRhICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZQYWdlcyAhPT0gdW5kZWZpbmVkICYmIG9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlJlY29yZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFRvZG86IFJlbW92ZSB0aGlzIG9uY2UgdGhlIGZyb250LWVuZCBpcyBjaGFuZ2VkLiBPbGl2ZSBjaGFuZ2VkIHRoZSB0eXBlIG9mIHRoZSByZXdhcmQgdHlwZSBmb3IgdGhlaXIgZW51bSBzbyB3ZSdyZSBnb2luZyB0byBwYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICogdGhpcyBzbyB3ZSBtYXRjaCB3aXRoIHdoYXRldmVyIHdlIGhhZCB0aGlzIG9uIHRoZSBmcm9udC1lbmQgYmVmb3JlIHRoZXkgbWFkZSB0aGlzIGJyZWFraW5nIGNoYW5nZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMuZm9yRWFjaChyZXRyaWV2ZWRPZmZlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIucmV3YXJkICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogc3dpdGNoIEZpeGVkIHRvIFJld2FyZEFtb3VudCBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogc3dpdGNoIFBlcmNlbnRhZ2UgdG8gUmV3YXJkUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPT09IFJld2FyZFR5cGUuUGVyY2VudGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9IFJld2FyZFR5cGUuUmV3YXJkUGVyY2VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9PT0gUmV3YXJkVHlwZS5GaXhlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9IFJld2FyZFR5cGUuUmV3YXJkQW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIHJlc3BvbnNlIGRhdGEgd2l0aCB0aGUgYXBwcm9wcmlhdGUgb2ZmZXJzIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyc1Jlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBnZXQgc2Vhc29uYWwgb2ZmZXJzIGNhbGwgJHtKU09OLnN0cmluZ2lmeShvZmZlcnNSZXNwb25zZSl9IWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=