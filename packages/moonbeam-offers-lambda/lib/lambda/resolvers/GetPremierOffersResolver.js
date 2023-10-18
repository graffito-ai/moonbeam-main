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
            const errorMessage = `Unsupported filter for premier offers query filter ${getOffersInput.filterType}. Use getFidelisPartners or getOffers instead.`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UHJlbWllck9mZmVyc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0UHJlbWllck9mZmVyc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVFtQztBQUVuQzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxjQUE4QixFQUEyQixFQUFFO0lBQ2pILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsdUNBQXVDO1FBQ3ZDLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLGFBQWEsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsYUFBYSxFQUFFO1lBQ3BILE1BQU0sWUFBWSxHQUFHLHNEQUFzRCxjQUFjLENBQUMsVUFBVSxnREFBZ0QsQ0FBQztZQUNySixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxpQ0FBZSxDQUFDLGVBQWU7YUFDN0MsQ0FBQTtTQUNKO2FBQU07WUFDSCwwQ0FBMEM7WUFDMUMsSUFBSSxjQUFjLENBQUMsVUFBVSxLQUFLLDZCQUFXLENBQUMsYUFBYTttQkFDcEQsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxjQUFjLENBQUMseUJBQXlCLEtBQUssU0FBUyxDQUFDLEVBQUU7Z0JBQzVKLE1BQU0sWUFBWSxHQUFHLHlEQUF5RCxjQUFjLENBQUMsVUFBVSxHQUFHLENBQUM7Z0JBQzNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFC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RyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO1NBQzdDLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQXZGWSxRQUFBLGdCQUFnQixvQkF1RjVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBHZXRPZmZlcnNJbnB1dCxcbiAgICBPZmZlcixcbiAgICBPZmZlckZpbHRlcixcbiAgICBPZmZlcnNFcnJvclR5cGUsXG4gICAgT2ZmZXJzUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgUHJlbWllck9ubGluZU9mZmVyT3JkZXJcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRQcmVtaWVyT2ZmZXJzIHJlc29sdmVyIC0gdXNlZCBtYWlubHkgZm9yIHJldHVybmluZyBwcmVtaWVyIG5lYXJieSxcbiAqIGFzIHdlbGwgYXMgcHJlbWllciBvbmxpbmUgb2ZmZXJzXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRPZmZlcnNJbnB1dCBvZmZlcnMgaW5wdXQgdXNlZCBmb3IgdGhlIG9mZmVycyBvYmplY3RzIHRvIGJlIHJldHJpZXZlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBPZmZlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFByZW1pZXJPZmZlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCk6IFByb21pc2U8T2ZmZXJzUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBjaGVjayBpZiBhIHZhbGlkIGZpbHRlciBpcyBwYXNzZWQgaW5cbiAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgIT09IE9mZmVyRmlsdGVyLlByZW1pZXJOZWFyYnkgJiYgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSAhPT0gT2ZmZXJGaWx0ZXIuUHJlbWllck9ubGluZSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIGZpbHRlciBmb3IgcHJlbWllciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uIFVzZSBnZXRGaWRlbGlzUGFydG5lcnMgb3IgZ2V0T2ZmZXJzIGluc3RlYWQuYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB2YWxpZCBpbmZvcm1hdGlvbiBpcyBwYXNzZWQgaW5cbiAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5QcmVtaWVyTmVhcmJ5XG4gICAgICAgICAgICAgICAgJiYgKCFnZXRPZmZlcnNJbnB1dC5yYWRpdXMgfHwgIWdldE9mZmVyc0lucHV0LnJhZGl1c0xhdGl0dWRlIHx8ICFnZXRPZmZlcnNJbnB1dC5yYWRpdXNMb25naXR1ZGUgfHwgZ2V0T2ZmZXJzSW5wdXQucmFkaXVzSW5jbHVkZU9ubGluZVN0b3JlcyA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIGluZm9ybWF0aW9uIHBhc3NlZCBpbiBmb3Igb2ZmZXJzIHF1ZXJ5IGZpbHRlciAke2dldE9mZmVyc0lucHV0LmZpbHRlclR5cGV9LmA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBHRVQgb2ZmZXJzIE9saXZlIFJFU1QgY2FsbFxuICAgICAgICAgICAgICAgIGNvbnN0IG9mZmVyc1Jlc3BvbnNlOiBPZmZlcnNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE9mZmVycyhnZXRPZmZlcnNJbnB1dCk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG9mZmVycyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICBpZiAob2ZmZXJzUmVzcG9uc2UgJiYgIW9mZmVyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhb2ZmZXJzUmVzcG9uc2UuZXJyb3JUeXBlICYmIG9mZmVyc1Jlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUGFnZXMgIT09IHVuZGVmaW5lZCAmJiBvZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZSZWNvcmRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbHRlciB0aGUgb25saW5lIG9mZmVycyBhY2NvcmRpbmcgdG8gaG93IHdlIHdhbnQgdGhlbSBkaXNwbGF5ZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLlByZW1pZXJPbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvcnQgdGhlIG9ubGluZSBvZmZlcnMgaG93IHdlIHdhbnQgdGhlbSBkaXNwbGF5ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmVtaWVyT25saW5lU29ydGVkTWFwOiBNYXA8bnVtYmVyLCBPZmZlcj4gPSBuZXcgTWFwPG51bWJlciwgT2ZmZXI+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycy5mb3JFYWNoKG9mZmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnaXZlIGEgd2VpZ2h0IHRvIHRoZSBicmFuZCBEQkEgZGVwZW5kaW5nIG9uIGhvdyB3ZSB3YW50IHRoZW0gdG8gc2hvdyB1cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyICE9PSB1bmRlZmluZWQgJiYgb2ZmZXIgIT09IG51bGwgJiYgb2ZmZXIhLmJyYW5kRGJhICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZlciEuYnJhbmREYmEgIT09IG51bGwgJiYgUHJlbWllck9ubGluZU9mZmVyT3JkZXIuaW5jbHVkZXMob2ZmZXIhLmJyYW5kRGJhIS50cmltU3RhcnQoKS50cmltRW5kKCkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbWllck9ubGluZVNvcnRlZE1hcC5zZXQoUHJlbWllck9ubGluZU9mZmVyT3JkZXIuaW5kZXhPZihvZmZlciEuYnJhbmREYmEhLnRyaW1TdGFydCgpLnRyaW1FbmQoKSksIG9mZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlbWllck9ubGluZVNvcnRlZE1hcCA9IG5ldyBNYXAoWy4uLnByZW1pZXJPbmxpbmVTb3J0ZWRNYXBdLnNvcnQoKGEsIGIpID0+IGFbMF0gLSBiWzBdKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgcmVzcG9uc2UncyBvZmZlcnMsIHRvIHRoZSBzb3J0ZWQgb2ZmZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3J0ZWRPZmZlcnM6IE9mZmVyW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZW1pZXJPbmxpbmVTb3J0ZWRNYXAuZm9yRWFjaCgob2ZmZXIsIF8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3J0ZWRPZmZlcnMucHVzaChvZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzID0gc29ydGVkT2ZmZXJzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5zIHRoZSByZXNwb25zZSBkYXRhIHdpdGggdGhlIGFwcHJvcHJpYXRlIG9mZmVycyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBvZmZlcnNSZXNwb25zZS5kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5zIHRoZSByZXNwb25zZSBkYXRhIHdpdGggdGhlIGFwcHJvcHJpYXRlIG9mZmVycyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBvZmZlcnNSZXNwb25zZS5kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgZ2V0IHByZW1pZXIgb2ZmZXJzIGNhbGwgJHtKU09OLnN0cmluZ2lmeShvZmZlcnNSZXNwb25zZSl9IWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19