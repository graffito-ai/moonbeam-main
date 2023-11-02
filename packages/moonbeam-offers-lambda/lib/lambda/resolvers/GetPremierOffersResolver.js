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
                    // filter the online offers according to how we want them displayed
                    if (getOffersInput.filterType === moonbeam_models_1.OfferFilter.PremierOnline) {
                        // sort the online offers how we want them displayed
                        let premierOnlineSortedMap = new Map();
                        offersResponse.data.offers.forEach(offer => {
                            // give a weight to the brand DBA depending on how we want them to show up
                            offer !== undefined && offer !== null && offer.brandDba !== undefined &&
                                offer.brandDba !== null && moonbeam_models_1.PremierOnlineOfferOrder.includes(offer.brandDba.trimStart().trimEnd()) &&
                                premierOnlineSortedMap.set(moonbeam_models_1.PremierOnlineOfferOrder.indexOf(offer.brandDba.trimStart().trimEnd()), offer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UHJlbWllck9mZmVyc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0UHJlbWllck9mZmVyc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVFtQztBQUVuQzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxjQUE4QixFQUEyQixFQUFFO0lBQ2pILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsdUNBQXVDO1FBQ3ZDLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLGFBQWEsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsYUFBYSxFQUFFO1lBQ3BILE1BQU0sWUFBWSxHQUFHLHNEQUFzRCxjQUFjLENBQUMsVUFBVSxtRUFBbUUsQ0FBQztZQUN4SyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxpQ0FBZSxDQUFDLGVBQWU7YUFDN0MsQ0FBQTtTQUNKO2FBQU07WUFDSCwwQ0FBMEM7WUFDMUMsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsYUFBYTttQkFDcEQsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxjQUFjLENBQUMseUJBQXlCLEtBQUssU0FBUyxDQUFDLEVBQUU7Z0JBQzVKLE1BQU0sWUFBWSxHQUFHLHlEQUF5RCxjQUFjLENBQUMsVUFBVSxHQUFHLENBQUM7Z0JBQzNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFC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RyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO1NBQzdDLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQXZGWSxRQUFBLGdCQUFnQixvQkF1RjVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBHZXRPZmZlcnNJbnB1dCxcbiAgICBPZmZlcixcbiAgICBPZmZlckZpbHRlcixcbiAgICBPZmZlcnNFcnJvclR5cGUsXG4gICAgT2ZmZXJzUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgUHJlbWllck9ubGluZU9mZmVyT3JkZXJcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRQcmVtaWVyT2ZmZXJzIHJlc29sdmVyIC0gdXNlZCBtYWlubHkgZm9yIHJldHVybmluZyBwcmVtaWVyIG5lYXJieSxcbiAqIGFzIHdlbGwgYXMgcHJlbWllciBvbmxpbmUgb2ZmZXJzXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRPZmZlcnNJbnB1dCBvZmZlcnMgaW5wdXQgdXNlZCBmb3IgdGhlIG9mZmVycyBvYmplY3RzIHRvIGJlIHJldHJpZXZlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBPZmZlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFByZW1pZXJPZmZlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCk6IFByb21pc2U8T2ZmZXJzUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBjaGVjayBpZiBhIHZhbGlkIGZpbHRlciBpcyBwYXNzZWQgaW5cbiAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLlByZW1pZXJOZWFyYnkgJiYgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSAhPT0gT2ZmZXJGaWx0ZXIuUHJlbWllck9ubGluZSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIGZpbHRlciBmb3IgcHJlbWllciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uIFVzZSBnZXRGaWRlbGlzUGFydG5lcnMsIGdldE9mZmVycyBvciBnZXRTZWFzb25hbE9mZmVycyBpbnN0ZWFkLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdmFsaWQgaW5mb3JtYXRpb24gaXMgcGFzc2VkIGluXG4gICAgICAgICAgICBpZiAoZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuUHJlbWllck5lYXJieVxuICAgICAgICAgICAgICAgICYmICghZ2V0T2ZmZXJzSW5wdXQucmFkaXVzIHx8ICFnZXRPZmZlcnNJbnB1dC5yYWRpdXNMYXRpdHVkZSB8fCAhZ2V0T2ZmZXJzSW5wdXQucmFkaXVzTG9uZ2l0dWRlIHx8IGdldE9mZmVyc0lucHV0LnJhZGl1c0luY2x1ZGVPbmxpbmVTdG9yZXMgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4gZm9yIG9mZmVycyBxdWVyeSBmaWx0ZXIgJHtnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlfS5gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgR0VUIG9mZmVycyBPbGl2ZSBSRVNUIGNhbGxcbiAgICAgICAgICAgICAgICBjb25zdCBvZmZlcnNSZXNwb25zZTogT2ZmZXJzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRPZmZlcnMoZ2V0T2ZmZXJzSW5wdXQpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBvZmZlcnMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgaWYgKG9mZmVyc1Jlc3BvbnNlICYmICFvZmZlcnNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIW9mZmVyc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBvZmZlcnNSZXNwb25zZS5kYXRhICYmXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlBhZ2VzICE9PSB1bmRlZmluZWQgJiYgb2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgdGhlIG9ubGluZSBvZmZlcnMgYWNjb3JkaW5nIHRvIGhvdyB3ZSB3YW50IHRoZW0gZGlzcGxheWVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5QcmVtaWVyT25saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzb3J0IHRoZSBvbmxpbmUgb2ZmZXJzIGhvdyB3ZSB3YW50IHRoZW0gZGlzcGxheWVkXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJlbWllck9ubGluZVNvcnRlZE1hcDogTWFwPG51bWJlciwgT2ZmZXI+ID0gbmV3IE1hcDxudW1iZXIsIE9mZmVyPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMuZm9yRWFjaChvZmZlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2l2ZSBhIHdlaWdodCB0byB0aGUgYnJhbmQgREJBIGRlcGVuZGluZyBvbiBob3cgd2Ugd2FudCB0aGVtIHRvIHNob3cgdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZlciAhPT0gdW5kZWZpbmVkICYmIG9mZmVyICE9PSBudWxsICYmIG9mZmVyIS5icmFuZERiYSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXIhLmJyYW5kRGJhICE9PSBudWxsICYmIFByZW1pZXJPbmxpbmVPZmZlck9yZGVyLmluY2x1ZGVzKG9mZmVyIS5icmFuZERiYSEudHJpbVN0YXJ0KCkudHJpbUVuZCgpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZW1pZXJPbmxpbmVTb3J0ZWRNYXAuc2V0KFByZW1pZXJPbmxpbmVPZmZlck9yZGVyLmluZGV4T2Yob2ZmZXIhLmJyYW5kRGJhIS50cmltU3RhcnQoKS50cmltRW5kKCkpLCBvZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZW1pZXJPbmxpbmVTb3J0ZWRNYXAgPSBuZXcgTWFwKFsuLi5wcmVtaWVyT25saW5lU29ydGVkTWFwXS5zb3J0KChhLCBiKSA9PiBhWzBdIC0gYlswXSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHJlc3BvbnNlJ3Mgb2ZmZXJzLCB0byB0aGUgc29ydGVkIG9mZmVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc29ydGVkT2ZmZXJzOiBPZmZlcltdID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVtaWVyT25saW5lU29ydGVkTWFwLmZvckVhY2goKG9mZmVyLCBfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVkT2ZmZXJzLnB1c2gob2ZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyA9IHNvcnRlZE9mZmVycztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGdldCBwcmVtaWVyIG9mZmVycyBjYWxsICR7SlNPTi5zdHJpbmdpZnkob2ZmZXJzUmVzcG9uc2UpfSFgO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==