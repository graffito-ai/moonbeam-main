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
                const offersResponse = (getOffersInput.filterType === moonbeam_models_1.OfferFilter.Nearby || getOffersInput.filterType === moonbeam_models_1.OfferFilter.CategorizedNearby) ?
                    await oliveClient.getOffers(getOffersInput) : await oliveClient.getOffers(getOffersInput, 3);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0T2ZmZXJzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRPZmZlcnNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFXbUM7QUFFbkM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsY0FBOEIsRUFBMkIsRUFBRTtJQUMxRyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLHVDQUF1QztRQUN2QyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxNQUFNLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLE1BQU07WUFDcEcsY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLGlCQUFpQixJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxpQkFBaUIsRUFBRTtZQUM1SCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsY0FBYyxDQUFDLFVBQVUsMEVBQTBFLENBQUM7WUFDdkssT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO2FBQzdDLENBQUE7U0FDSjthQUFNO1lBQ0gsMENBQTBDO1lBQzFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsTUFBTSxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxpQkFBaUIsQ0FBQzttQkFDOUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxjQUFjLENBQUMseUJBQXlC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O0FBcEhZLFFBQUEsU0FBUyxhQW9IckIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEdldE9mZmVyc0lucHV0LFxuICAgIE9mZmVyLFxuICAgIE9mZmVyRmlsdGVyLFxuICAgIE9mZmVyc0Vycm9yVHlwZSxcbiAgICBPZmZlcnNSZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudCxcbiAgICBQcmVtaWVyT25saW5lRGV2T2ZmZXJJZHMsXG4gICAgUHJlbWllck9ubGluZVByb2RPZmZlcklkcyxcbiAgICBSZXdhcmRUeXBlLFxuICAgIFN0YWdlc1xufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldE9mZmVycyByZXNvbHZlciAtIHVzZWQgbWFpbmx5IGZvciByZXR1cm5pbmcgbmVhcmJ5IGFzIHdlbGwgYXMgb25saW5lIG9mZmVyc1xuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZ2V0T2ZmZXJzSW5wdXQgb2ZmZXJzIGlucHV0IHVzZWQgZm9yIHRoZSBvZmZlcnMgb2JqZWN0cyB0byBiZSByZXRyaWV2ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgT2ZmZXJzUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRPZmZlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCk6IFByb21pc2U8T2ZmZXJzUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBjaGVjayBpZiBhIHZhbGlkIGZpbHRlciBpcyBwYXNzZWQgaW5cbiAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLk5lYXJieSAmJiBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlICE9PSBPZmZlckZpbHRlci5PbmxpbmUgJiZcbiAgICAgICAgICAgIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLkNhdGVnb3JpemVkT25saW5lICYmIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLkNhdGVnb3JpemVkTmVhcmJ5KSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgZmlsdGVyIGZvciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uIFVzZSBnZXRGaWRlbGlzUGFydG5lcnMsIGdldFByZW1pZXJPZmZlcnMgb3IgZ2V0U2Vhc29uYWxPZmZlcnMgaW5zdGVhZC5gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkIGluZm9ybWF0aW9uIGlzIHBhc3NlZCBpblxuICAgICAgICAgICAgaWYgKChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5OZWFyYnkgfHwgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuQ2F0ZWdvcml6ZWROZWFyYnkpXG4gICAgICAgICAgICAgICAgJiYgKCFnZXRPZmZlcnNJbnB1dC5yYWRpdXMgfHwgIWdldE9mZmVyc0lucHV0LnJhZGl1c0xhdGl0dWRlIHx8ICFnZXRPZmZlcnNJbnB1dC5yYWRpdXNMb25naXR1ZGUgfHwgZ2V0T2ZmZXJzSW5wdXQucmFkaXVzSW5jbHVkZU9ubGluZVN0b3JlcyA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIGluZm9ybWF0aW9uIHBhc3NlZCBpbiBmb3Igb2ZmZXJzIHF1ZXJ5IGZpbHRlciAke2dldE9mZmVyc0lucHV0LmZpbHRlclR5cGV9LmA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBHRVQgb2ZmZXJzIE9saXZlIFJFU1QgY2FsbFxuICAgICAgICAgICAgICAgIGNvbnN0IG9mZmVyc1Jlc3BvbnNlOiBPZmZlcnNSZXNwb25zZSA9IChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5OZWFyYnkgfHwgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuQ2F0ZWdvcml6ZWROZWFyYnkpID9cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgb2xpdmVDbGllbnQuZ2V0T2ZmZXJzKGdldE9mZmVyc0lucHV0KSA6IGF3YWl0IG9saXZlQ2xpZW50LmdldE9mZmVycyhnZXRPZmZlcnNJbnB1dCwgMyk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG9mZmVycyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICBpZiAob2ZmZXJzUmVzcG9uc2UgJiYgIW9mZmVyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhb2ZmZXJzUmVzcG9uc2UuZXJyb3JUeXBlICYmIG9mZmVyc1Jlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUGFnZXMgIT09IHVuZGVmaW5lZCAmJiBvZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZSZWNvcmRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUb2RvOiBSZW1vdmUgdGhpcyBvbmNlIHRoZSBmcm9udC1lbmQgaXMgY2hhbmdlZC4gT2xpdmUgY2hhbmdlZCB0aGUgdHlwZSBvZiB0aGUgcmV3YXJkIHR5cGUgZm9yIHRoZWlyIGVudW0gc28gd2UncmUgZ29pbmcgdG8gcGF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICogdGhpcyBzbyB3ZSBtYXRjaCB3aXRoIHdoYXRldmVyIHdlIGhhZCB0aGlzIG9uIHRoZSBmcm9udC1lbmQgYmVmb3JlIHRoZXkgbWFkZSB0aGlzIGJyZWFraW5nIGNoYW5nZS5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzLmZvckVhY2gocmV0cmlldmVkT2ZmZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQgIT09IHVuZGVmaW5lZCAmJiByZXRyaWV2ZWRPZmZlci5yZXdhcmQgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUgIT09IHVuZGVmaW5lZCAmJiByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBzd2l0Y2ggRml4ZWQgdG8gUmV3YXJkQW1vdW50IGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHN3aXRjaCBQZXJjZW50YWdlIHRvIFJld2FyZFBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9PT0gUmV3YXJkVHlwZS5QZXJjZW50YWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPSBSZXdhcmRUeXBlLlJld2FyZFBlcmNlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID09PSBSZXdhcmRUeXBlLkZpeGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPSBSZXdhcmRUeXBlLlJld2FyZEFtb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiB3ZSBuZWVkIHRvIGZpbHRlciBvdXQgdGhlIFByZW1pZXIgT25saW5lIGFuZCBQcmVtaWVyIE5lYXJieSBvZmZlcnMgc2luY2UgdGhleSB3aWxsIGJlIGRpc3BsYXllZFxuICAgICAgICAgICAgICAgICAgICAgKiBhcyBwYXJ0IG9mIHRoZSBnZXRQcmVtaWVyT2ZmZXJzUmVzb2x2ZXIgcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGxldCBhbGxPZmZlcnM6IE9mZmVyW10gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuTmVhcmJ5IHx8IGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLkNhdGVnb3JpemVkTmVhcmJ5IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5DYXRlZ29yaXplZE9ubGluZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5PbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzLmZvckVhY2gob2ZmZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5FTlZfTkFNRSEgPT09IFN0YWdlcy5ERVYgJiYgIVByZW1pZXJPbmxpbmVEZXZPZmZlcklkcy5pbmNsdWRlcyhvZmZlciEuaWQhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxPZmZlcnMucHVzaChvZmZlciEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuRU5WX05BTUUhID09PSBTdGFnZXMuUFJPRCAmJiAhUHJlbWllck9ubGluZVByb2RPZmZlcklkcy5pbmNsdWRlcyhvZmZlciEuaWQhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxPZmZlcnMucHVzaChvZmZlciEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyA9IGFsbE9mZmVycztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyc1Jlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBnZXQgb2ZmZXJzIGNhbGwgJHtKU09OLnN0cmluZ2lmeShvZmZlcnNSZXNwb25zZSl9IWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19