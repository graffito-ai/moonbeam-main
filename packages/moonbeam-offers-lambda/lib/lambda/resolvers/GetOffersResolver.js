"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffers = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetOffers resolver - used mainly for returning nearby as well as online offers
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
const getOffers = async (fieldName, getOffersInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // check if a valid filter is passed in
        if (getOffersInput.filterType !== moonbeam_models_1.OfferFilter.Nearby && getOffersInput.filterType !== moonbeam_models_1.OfferFilter.Online &&
            getOffersInput.filterType !== moonbeam_models_1.OfferFilter.CategorizedOnline && getOffersInput.filterType !== moonbeam_models_1.OfferFilter.CategorizedNearby) {
            const errorMessage = `Unsupported filter for offers query filter ${getOffersInput.filterType}. Use getFidelisPartners, getPremierOffers or getSeasonalOffers instead.`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.OffersErrorType.ValidationError
            };
        }
        else {
            // check if valid information is passed in
            if ((getOffersInput.filterType === moonbeam_models_1.OfferFilter.Nearby || getOffersInput.filterType === moonbeam_models_1.OfferFilter.CategorizedNearby)
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
                    /**
                     * we need to filter out the Premier Online and Premier Nearby offers since they will be displayed
                     * as part of the getPremierOffersResolver query
                     */
                    let allOffers = [];
                    if (getOffersInput.filterType === moonbeam_models_1.OfferFilter.Nearby || getOffersInput.filterType === moonbeam_models_1.OfferFilter.CategorizedNearby ||
                        getOffersInput.filterType === moonbeam_models_1.OfferFilter.CategorizedOnline) {
                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        };
                    }
                    if (getOffersInput.filterType === moonbeam_models_1.OfferFilter.Online) {
                        offersResponse.data.offers.forEach(offer => {
                            if (process.env.ENV_NAME === moonbeam_models_1.Stages.DEV && !moonbeam_models_1.PremierOnlineDevOfferIds.includes(offer.id)) {
                                allOffers.push(offer);
                            }
                            if (process.env.ENV_NAME === moonbeam_models_1.Stages.PROD && !moonbeam_models_1.PremierOnlineProdOfferIds.includes(offer.id)) {
                                allOffers.push(offer);
                            }
                        });
                        offersResponse.data.offers = allOffers;
                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        };
                    }
                    // returns the response data with the appropriate offers information
                    return {
                        data: offersResponse.data
                    };
                }
                else {
                    const errorMessage = `Unexpected response structure returned from the get offers call ${JSON.stringify(offersResponse)}!`;
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
exports.getOffers = getOffers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0T2ZmZXJzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRPZmZlcnNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFXbUM7QUFFbkM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsY0FBOEIsRUFBMkIsRUFBRTtJQUMxRyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLHVDQUF1QztRQUN2QyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxNQUFNLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLE1BQU07WUFDcEcsY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLGlCQUFpQixJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxpQkFBaUIsRUFBRTtZQUM1SCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsY0FBYyxDQUFDLFVBQVUsMEVBQTBFLENBQUM7WUFDdkssT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO2FBQzdDLENBQUE7U0FDSjthQUFNO1lBQ0gsMENBQTBDO1lBQzFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsTUFBTSxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxpQkFBaUIsQ0FBQzttQkFDOUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxjQUFjLENBQUMseUJBQXlC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QUFRLENBQUMsS0FBTSxDQUFDLEVBQUcsQ0FBQyxFQUFFO2dDQUMxRixTQUFTLENBQUMsSUFBSSxDQUFDLEtBQU0sQ0FBQyxDQUFDOzZCQUMxQjt3QkFDTCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7d0JBRXZDLG9FQUFvRTt3QkFDcEUsT0FBTzs0QkFDSCxJQUFJLEVBQUUsY0FBYyxDQUFDLElBQUk7eUJBQzVCLENBQUE7cUJBQ0o7b0JBRUQsb0VBQW9FO29CQUNwRSxPQUFPO3dCQUNILElBQUksRUFBRSxjQUFjLENBQUMsSUFBSTtxQkFDNUIsQ0FBQTtpQkFDSjtxQkFBTTtvQkFDSCxNQUFNLFlBQVksR0FBRyxtRUFBbUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDO29CQUMxSCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxQixzSEFBc0g7b0JBQ3RILE9BQU87d0JBQ0gsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTt3QkFDMUMsWUFBWSxFQUFFLFlBQVk7cUJBQzdCLENBQUE7aUJBQ0o7YUFDSjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTtTQUM3QyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFuSFksUUFBQSxTQUFTLGFBbUhyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgR2V0T2ZmZXJzSW5wdXQsXG4gICAgT2ZmZXIsXG4gICAgT2ZmZXJGaWx0ZXIsXG4gICAgT2ZmZXJzRXJyb3JUeXBlLFxuICAgIE9mZmVyc1Jlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LFxuICAgIFByZW1pZXJPbmxpbmVEZXZPZmZlcklkcyxcbiAgICBQcmVtaWVyT25saW5lUHJvZE9mZmVySWRzLFxuICAgIFJld2FyZFR5cGUsXG4gICAgU3RhZ2VzXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0T2ZmZXJzIHJlc29sdmVyIC0gdXNlZCBtYWlubHkgZm9yIHJldHVybmluZyBuZWFyYnkgYXMgd2VsbCBhcyBvbmxpbmUgb2ZmZXJzXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRPZmZlcnNJbnB1dCBvZmZlcnMgaW5wdXQgdXNlZCBmb3IgdGhlIG9mZmVycyBvYmplY3RzIHRvIGJlIHJldHJpZXZlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBPZmZlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldE9mZmVycyA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0T2ZmZXJzSW5wdXQ6IEdldE9mZmVyc0lucHV0KTogUHJvbWlzZTxPZmZlcnNSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIGEgdmFsaWQgZmlsdGVyIGlzIHBhc3NlZCBpblxuICAgICAgICBpZiAoZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSAhPT0gT2ZmZXJGaWx0ZXIuTmVhcmJ5ICYmIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLk9ubGluZSAmJlxuICAgICAgICAgICAgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSAhPT0gT2ZmZXJGaWx0ZXIuQ2F0ZWdvcml6ZWRPbmxpbmUgJiYgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSAhPT0gT2ZmZXJGaWx0ZXIuQ2F0ZWdvcml6ZWROZWFyYnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbnN1cHBvcnRlZCBmaWx0ZXIgZm9yIG9mZmVycyBxdWVyeSBmaWx0ZXIgJHtnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlfS4gVXNlIGdldEZpZGVsaXNQYXJ0bmVycywgZ2V0UHJlbWllck9mZmVycyBvciBnZXRTZWFzb25hbE9mZmVycyBpbnN0ZWFkLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdmFsaWQgaW5mb3JtYXRpb24gaXMgcGFzc2VkIGluXG4gICAgICAgICAgICBpZiAoKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLk5lYXJieSB8fCBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5DYXRlZ29yaXplZE5lYXJieSlcbiAgICAgICAgICAgICAgICAmJiAoIWdldE9mZmVyc0lucHV0LnJhZGl1cyB8fCAhZ2V0T2ZmZXJzSW5wdXQucmFkaXVzTGF0aXR1ZGUgfHwgIWdldE9mZmVyc0lucHV0LnJhZGl1c0xvbmdpdHVkZSB8fCBnZXRPZmZlcnNJbnB1dC5yYWRpdXNJbmNsdWRlT25saW5lU3RvcmVzID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluIGZvciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIEdFVCBvZmZlcnMgT2xpdmUgUkVTVCBjYWxsXG4gICAgICAgICAgICAgICAgY29uc3Qgb2ZmZXJzUmVzcG9uc2U6IE9mZmVyc1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0T2ZmZXJzKGdldE9mZmVyc0lucHV0KTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgb2ZmZXJzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgIGlmIChvZmZlcnNSZXNwb25zZSAmJiAhb2ZmZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFvZmZlcnNSZXNwb25zZS5lcnJvclR5cGUgJiYgb2ZmZXJzUmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZQYWdlcyAhPT0gdW5kZWZpbmVkICYmIG9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlJlY29yZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRvZG86IFJlbW92ZSB0aGlzIG9uY2UgdGhlIGZyb250LWVuZCBpcyBjaGFuZ2VkLiBPbGl2ZSBjaGFuZ2VkIHRoZSB0eXBlIG9mIHRoZSByZXdhcmQgdHlwZSBmb3IgdGhlaXIgZW51bSBzbyB3ZSdyZSBnb2luZyB0byBwYXRjaFxuICAgICAgICAgICAgICAgICAgICAgKiB0aGlzIHNvIHdlIG1hdGNoIHdpdGggd2hhdGV2ZXIgd2UgaGFkIHRoaXMgb24gdGhlIGZyb250LWVuZCBiZWZvcmUgdGhleSBtYWRlIHRoaXMgYnJlYWtpbmcgY2hhbmdlLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMuZm9yRWFjaChyZXRyaWV2ZWRPZmZlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkT2ZmZXIgIT09IHVuZGVmaW5lZCAmJiByZXRyaWV2ZWRPZmZlciAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyLnJld2FyZCAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHN3aXRjaCBGaXhlZCB0byBSZXdhcmRBbW91bnQgYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogc3dpdGNoIFBlcmNlbnRhZ2UgdG8gUmV3YXJkUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID09PSBSZXdhcmRUeXBlLlBlcmNlbnRhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9IFJld2FyZFR5cGUuUmV3YXJkUGVyY2VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPT09IFJld2FyZFR5cGUuRml4ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9IFJld2FyZFR5cGUuUmV3YXJkQW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIHdlIG5lZWQgdG8gZmlsdGVyIG91dCB0aGUgUHJlbWllciBPbmxpbmUgYW5kIFByZW1pZXIgTmVhcmJ5IG9mZmVycyBzaW5jZSB0aGV5IHdpbGwgYmUgZGlzcGxheWVkXG4gICAgICAgICAgICAgICAgICAgICAqIGFzIHBhcnQgb2YgdGhlIGdldFByZW1pZXJPZmZlcnNSZXNvbHZlciBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgbGV0IGFsbE9mZmVyczogT2ZmZXJbXSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5OZWFyYnkgfHwgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuQ2F0ZWdvcml6ZWROZWFyYnkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLkNhdGVnb3JpemVkT25saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5zIHRoZSByZXNwb25zZSBkYXRhIHdpdGggdGhlIGFwcHJvcHJpYXRlIG9mZmVycyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBvZmZlcnNSZXNwb25zZS5kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLk9ubGluZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMuZm9yRWFjaChvZmZlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52LkVOVl9OQU1FISA9PT0gU3RhZ2VzLkRFViAmJiAhUHJlbWllck9ubGluZURldk9mZmVySWRzLmluY2x1ZGVzKG9mZmVyIS5pZCEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE9mZmVycy5wdXNoKG9mZmVyISk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5FTlZfTkFNRSEgPT09IFN0YWdlcy5QUk9EICYmICFQcmVtaWVyT25saW5lUHJvZE9mZmVySWRzLmluY2x1ZGVzKG9mZmVyIS5pZCEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE9mZmVycy5wdXNoKG9mZmVyISk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzID0gYWxsT2ZmZXJzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5zIHRoZSByZXNwb25zZSBkYXRhIHdpdGggdGhlIGFwcHJvcHJpYXRlIG9mZmVycyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBvZmZlcnNSZXNwb25zZS5kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5zIHRoZSByZXNwb25zZSBkYXRhIHdpdGggdGhlIGFwcHJvcHJpYXRlIG9mZmVycyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGdldCBvZmZlcnMgY2FsbCAke0pTT04uc3RyaW5naWZ5KG9mZmVyc1Jlc3BvbnNlKX0hYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=