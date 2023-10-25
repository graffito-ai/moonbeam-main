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
            const errorMessage = `Unsupported filter for offers query filter ${getOffersInput.filterType}. Use getFidelisPartners or getPremierOffers instead.`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0T2ZmZXJzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRPZmZlcnNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFVbUM7QUFFbkM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsY0FBOEIsRUFBMkIsRUFBRTtJQUMxRyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLHVDQUF1QztRQUN2QyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxNQUFNLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLE1BQU07WUFDcEcsY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLGlCQUFpQixJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxpQkFBaUIsRUFBRTtZQUM1SCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsY0FBYyxDQUFDLFVBQVUsdURBQXVELENBQUM7WUFDcEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO2FBQzdDLENBQUE7U0FDSjthQUFNO1lBQ0gsMENBQTBDO1lBQzFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsTUFBTSxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxpQkFBaUIsQ0FBQzttQkFDOUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxjQUFjLENBQUMseUJBQXlC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LG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTtTQUM3QyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUE3RlksUUFBQSxTQUFTLGFBNkZyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgR2V0T2ZmZXJzSW5wdXQsXG4gICAgT2ZmZXIsXG4gICAgT2ZmZXJGaWx0ZXIsXG4gICAgT2ZmZXJzRXJyb3JUeXBlLFxuICAgIE9mZmVyc1Jlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LFxuICAgIFByZW1pZXJPbmxpbmVEZXZPZmZlcklkcyxcbiAgICBQcmVtaWVyT25saW5lUHJvZE9mZmVySWRzLFxuICAgIFN0YWdlc1xufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldE9mZmVycyByZXNvbHZlciAtIHVzZWQgbWFpbmx5IGZvciByZXR1cm5pbmcgbmVhcmJ5IGFzIHdlbGwgYXMgb25saW5lIG9mZmVyc1xuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZ2V0T2ZmZXJzSW5wdXQgb2ZmZXJzIGlucHV0IHVzZWQgZm9yIHRoZSBvZmZlcnMgb2JqZWN0cyB0byBiZSByZXRyaWV2ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgT2ZmZXJzUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRPZmZlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCk6IFByb21pc2U8T2ZmZXJzUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBjaGVjayBpZiBhIHZhbGlkIGZpbHRlciBpcyBwYXNzZWQgaW5cbiAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLk5lYXJieSAmJiBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlICE9PSBPZmZlckZpbHRlci5PbmxpbmUgJiZcbiAgICAgICAgICAgIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLkNhdGVnb3JpemVkT25saW5lICYmIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLkNhdGVnb3JpemVkTmVhcmJ5KSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgZmlsdGVyIGZvciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uIFVzZSBnZXRGaWRlbGlzUGFydG5lcnMgb3IgZ2V0UHJlbWllck9mZmVycyBpbnN0ZWFkLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdmFsaWQgaW5mb3JtYXRpb24gaXMgcGFzc2VkIGluXG4gICAgICAgICAgICBpZiAoKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLk5lYXJieSB8fCBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5DYXRlZ29yaXplZE5lYXJieSlcbiAgICAgICAgICAgICAgICAmJiAoIWdldE9mZmVyc0lucHV0LnJhZGl1cyB8fCAhZ2V0T2ZmZXJzSW5wdXQucmFkaXVzTGF0aXR1ZGUgfHwgIWdldE9mZmVyc0lucHV0LnJhZGl1c0xvbmdpdHVkZSB8fCBnZXRPZmZlcnNJbnB1dC5yYWRpdXNJbmNsdWRlT25saW5lU3RvcmVzID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluIGZvciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIEdFVCBvZmZlcnMgT2xpdmUgUkVTVCBjYWxsXG4gICAgICAgICAgICAgICAgY29uc3Qgb2ZmZXJzUmVzcG9uc2U6IE9mZmVyc1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0T2ZmZXJzKGdldE9mZmVyc0lucHV0KTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgb2ZmZXJzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgIGlmIChvZmZlcnNSZXNwb25zZSAmJiAhb2ZmZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFvZmZlcnNSZXNwb25zZS5lcnJvclR5cGUgJiYgb2ZmZXJzUmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZQYWdlcyAhPT0gdW5kZWZpbmVkICYmIG9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlJlY29yZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiB3ZSBuZWVkIHRvIGZpbHRlciBvdXQgdGhlIFByZW1pZXIgT25saW5lIGFuZCBQcmVtaWVyIE5lYXJieSBvZmZlcnMgc2luY2UgdGhleSB3aWxsIGJlIGRpc3BsYXllZFxuICAgICAgICAgICAgICAgICAgICAgKiBhcyBwYXJ0IG9mIHRoZSBnZXRQcmVtaWVyT2ZmZXJzUmVzb2x2ZXIgcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGxldCBhbGxPZmZlcnM6IE9mZmVyW10gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuTmVhcmJ5IHx8IGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLkNhdGVnb3JpemVkTmVhcmJ5IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5DYXRlZ29yaXplZE9ubGluZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5PbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzLmZvckVhY2gob2ZmZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5FTlZfTkFNRSEgPT09IFN0YWdlcy5ERVYgJiYgIVByZW1pZXJPbmxpbmVEZXZPZmZlcklkcy5pbmNsdWRlcyhvZmZlciEuaWQhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxPZmZlcnMucHVzaChvZmZlciEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuRU5WX05BTUUhID09PSBTdGFnZXMuUFJPRCAmJiAhUHJlbWllck9ubGluZVByb2RPZmZlcklkcy5pbmNsdWRlcyhvZmZlciEuaWQhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxPZmZlcnMucHVzaChvZmZlciEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyA9IGFsbE9mZmVycztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyc1Jlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBnZXQgb2ZmZXJzIGNhbGwgJHtKU09OLnN0cmluZ2lmeShvZmZlcnNSZXNwb25zZSl9IWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19