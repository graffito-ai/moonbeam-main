"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFidelisPartners = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetFidelisPartners resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link OffersResponse}
 */
const getFidelisPartners = async (fieldName) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
        const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
        // we start with page 1
        let pageNumber = 1;
        // constant used to keep track of the Fidelis offers retrieved
        let fidelisOffers = [];
        // execute the first GET offers Olive REST call
        const firstOffersResponse = await oliveClient.getOffers({
            availability: moonbeam_models_1.OfferAvailability.ClientOnly,
            countryCode: moonbeam_models_1.CountryCode.Us,
            redemptionType: moonbeam_models_1.RedemptionType.Cardlinked,
            filterType: moonbeam_models_1.OfferFilter.Fidelis,
            offerStates: [moonbeam_models_1.OfferState.Active, moonbeam_models_1.OfferState.Scheduled],
            pageNumber: pageNumber,
            pageSize: 50 // display 50 offers at a time (that we will then use to aggregate throughout our Fidelis partners)
        });
        // check to see if the first offers call was executed successfully
        if (firstOffersResponse && !firstOffersResponse.errorMessage && !firstOffersResponse.errorType && firstOffersResponse.data &&
            firstOffersResponse.data.totalNumberOfPages && firstOffersResponse.data.totalNumberOfRecords && firstOffersResponse.data.offers) {
            // set the Fidelis offers accordingly
            fidelisOffers.push(...firstOffersResponse.data.offers);
            // execute as many calls as the number of remaining pages (in order to get all Fidelis offers)
            let remainingPages = firstOffersResponse.data.totalNumberOfPages - pageNumber;
            while (remainingPages > 0) {
                // increase pageNumber
                pageNumber += 1;
                // execute the subsquent GET offers Olive REST call
                const subsequentOffersResponse = await oliveClient.getOffers({
                    availability: moonbeam_models_1.OfferAvailability.ClientOnly,
                    countryCode: moonbeam_models_1.CountryCode.Us,
                    redemptionType: moonbeam_models_1.RedemptionType.Cardlinked,
                    filterType: moonbeam_models_1.OfferFilter.Fidelis,
                    offerStates: [moonbeam_models_1.OfferState.Active, moonbeam_models_1.OfferState.Scheduled],
                    pageNumber: pageNumber,
                    pageSize: 50 // display 50 offers at a time (that we will then use to aggregate throughout our Fidelis partners)
                });
                // check to see if the subsequent offers call was executed successfully
                if (subsequentOffersResponse && !subsequentOffersResponse.errorMessage && !subsequentOffersResponse.errorType && subsequentOffersResponse.data &&
                    subsequentOffersResponse.data.totalNumberOfPages !== undefined && subsequentOffersResponse.data.totalNumberOfRecords !== undefined &&
                    subsequentOffersResponse.data.offers !== undefined) {
                    // set the Fidelis offers accordingly
                    fidelisOffers.push(...subsequentOffersResponse.data.offers);
                }
                else {
                    const errorMessage = `Unexpected response structure returned from a subsequent get offers call ${JSON.stringify(subsequentOffersResponse)} for page ${pageNumber}!`;
                    console.log(errorMessage);
                    // if there are errors associated with the call, just return the error message and error type from the upstream client
                    return {
                        errorType: moonbeam_models_1.OffersErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            }
            // check if there are no matched Fidelis offers returned
            if (fidelisOffers.length === 0) {
                const errorMessage = `No Fidelis offers to display for partners!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.OffersErrorType.NoneOrAbsent
                };
            }
            else {
                // go through the retrieved Fidelis offers from all record pages, and build the Fidelis partners accordingly
                const fidelisPartnersMap = new Map();
                const fidelisPartners = [];
                fidelisOffers.forEach(offer => {
                    // check to see if the offer's Fidelis partner, already exists in the map above
                    if (fidelisPartnersMap.has(offer.brandDba)) {
                        // if it already does exist, then add the offer in the element's list of offers (as the value from the key,pair)
                        const existingPartnerOffers = fidelisPartnersMap.get(offer.brandDba);
                        existingPartnerOffers.push(offer);
                        fidelisPartnersMap.set(offer.brandDba, existingPartnerOffers);
                    }
                    else {
                        // if it does not, then create a new key,value pair with this partner and the offer observed
                        fidelisPartnersMap.set(offer.brandDba, [offer]);
                    }
                });
                // build the list of partners to return
                fidelisPartnersMap.forEach((fidelisOffers, brandName) => {
                    fidelisPartners.push({
                        brandName: brandName,
                        numberOfOffers: fidelisOffers.length,
                        offers: fidelisOffers
                    });
                });
                // return the list of Fidelis partners alongside their offers
                return {
                    data: fidelisPartners
                };
            }
        }
        else {
            const errorMessage = `Unexpected response structure returned from the first get offers call ${JSON.stringify(firstOffersResponse)}!`;
            console.log(errorMessage);
            // if there are errors associated with the call, just return the error message and error type from the upstream client
            return {
                errorType: moonbeam_models_1.OffersErrorType.ValidationError,
                errorMessage: errorMessage
            };
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
exports.getFidelisPartners = getFidelisPartners;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RmlkZWxpc3RQYXJ0bmVyc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0RmlkZWxpc3RQYXJ0bmVyc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVVtQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQW1DLEVBQUU7SUFDM0YsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxvR0FBb0c7UUFDcEcsTUFBTSxXQUFXLEdBQUcsSUFBSSw2QkFBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRW5FLHVCQUF1QjtRQUN2QixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFFbkIsOERBQThEO1FBQzlELElBQUksYUFBYSxHQUFtQixFQUFFLENBQUM7UUFFdkMsK0NBQStDO1FBQy9DLE1BQU0sbUJBQW1CLEdBQW1CLE1BQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUNwRSxZQUFZLEVBQUUsbUNBQWlCLENBQUMsVUFBVTtZQUMxQyxXQUFXLEVBQUUsNkJBQVcsQ0FBQyxFQUFFO1lBQzNCLGNBQWMsRUFBRSxnQ0FBYyxDQUFDLFVBQVU7WUFDekMsVUFBVSxFQUFFLDZCQUFXLENBQUMsT0FBTztZQUMvQixXQUFXLEVBQUUsQ0FBQyw0QkFBVSxDQUFDLE1BQU0sRUFBRSw0QkFBVSxDQUFDLFNBQVMsQ0FBQztZQUN0RCxVQUFVLEVBQUUsVUFBVTtZQUN0QixRQUFRLEVBQUUsRUFBRSxDQUFDLG1HQUFtRztTQUNuSCxDQUFDLENBQUM7UUFFSCxrRUFBa0U7UUFDbEUsSUFBSSxtQkFBbUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksSUFBSSxDQUFDLG1CQUFt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QUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTVIWSxRQUFBLGtCQUFrQixzQkE0SDlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBGaWRlbGlzUGFydG5lcixcbiAgICBGaWRlbGlzUGFydG5lclJlc3BvbnNlLFxuICAgIE1heWJlLFxuICAgIE9mZmVyLFxuICAgIE9mZmVyc0Vycm9yVHlwZSxcbiAgICBPZmZlcnNSZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudCxcbiAgICBSZWRlbXB0aW9uVHlwZSxcbiAgICBDb3VudHJ5Q29kZSwgT2ZmZXJBdmFpbGFiaWxpdHksIE9mZmVyRmlsdGVyLCBPZmZlclN0YXRlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0RmlkZWxpc1BhcnRuZXJzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgT2ZmZXJzUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRGaWRlbGlzUGFydG5lcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEZpZGVsaXNQYXJ0bmVyUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAvLyB3ZSBzdGFydCB3aXRoIHBhZ2UgMVxuICAgICAgICBsZXQgcGFnZU51bWJlciA9IDE7XG5cbiAgICAgICAgLy8gY29uc3RhbnQgdXNlZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBGaWRlbGlzIG9mZmVycyByZXRyaWV2ZWRcbiAgICAgICAgbGV0IGZpZGVsaXNPZmZlcnM6IE1heWJlPE9mZmVyPltdID0gW107XG5cbiAgICAgICAgLy8gZXhlY3V0ZSB0aGUgZmlyc3QgR0VUIG9mZmVycyBPbGl2ZSBSRVNUIGNhbGxcbiAgICAgICAgY29uc3QgZmlyc3RPZmZlcnNSZXNwb25zZTogT2ZmZXJzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRPZmZlcnMoe1xuICAgICAgICAgICAgYXZhaWxhYmlsaXR5OiBPZmZlckF2YWlsYWJpbGl0eS5DbGllbnRPbmx5LFxuICAgICAgICAgICAgY291bnRyeUNvZGU6IENvdW50cnlDb2RlLlVzLFxuICAgICAgICAgICAgcmVkZW1wdGlvblR5cGU6IFJlZGVtcHRpb25UeXBlLkNhcmRsaW5rZWQsIC8vIG9ubHkgaW50ZXJlc3RlZCBpbiBjYXJkIGxpbmtlZCBvZmZlcnNcbiAgICAgICAgICAgIGZpbHRlclR5cGU6IE9mZmVyRmlsdGVyLkZpZGVsaXMsXG4gICAgICAgICAgICBvZmZlclN0YXRlczogW09mZmVyU3RhdGUuQWN0aXZlLCBPZmZlclN0YXRlLlNjaGVkdWxlZF0sIC8vIHdlIHdhbnQgdG8gcmV0cmlldmUgYWN0aXZlIChyZWd1bGFyIGRpc2NvdW50KSBhbmQgc2NoZWR1bGVkIChiaXJ0aGRheSwgaG9saWRheSkgb2ZmZXJzXG4gICAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlTnVtYmVyLFxuICAgICAgICAgICAgcGFnZVNpemU6IDUwIC8vIGRpc3BsYXkgNTAgb2ZmZXJzIGF0IGEgdGltZSAodGhhdCB3ZSB3aWxsIHRoZW4gdXNlIHRvIGFnZ3JlZ2F0ZSB0aHJvdWdob3V0IG91ciBGaWRlbGlzIHBhcnRuZXJzKVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGZpcnN0IG9mZmVycyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgaWYgKGZpcnN0T2ZmZXJzUmVzcG9uc2UgJiYgIWZpcnN0T2ZmZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFmaXJzdE9mZmVyc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBmaXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgICAgIGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUGFnZXMgJiYgZmlyc3RPZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZSZWNvcmRzICYmIGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMpIHtcbiAgICAgICAgICAgIC8vIHNldCB0aGUgRmlkZWxpcyBvZmZlcnMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGZpZGVsaXNPZmZlcnMucHVzaCguLi5maXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzKTtcblxuICAgICAgICAgICAgLy8gZXhlY3V0ZSBhcyBtYW55IGNhbGxzIGFzIHRoZSBudW1iZXIgb2YgcmVtYWluaW5nIHBhZ2VzIChpbiBvcmRlciB0byBnZXQgYWxsIEZpZGVsaXMgb2ZmZXJzKVxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ1BhZ2VzID0gZmlyc3RPZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZQYWdlcyAtIHBhZ2VOdW1iZXI7XG4gICAgICAgICAgICB3aGlsZSAocmVtYWluaW5nUGFnZXMgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gaW5jcmVhc2UgcGFnZU51bWJlclxuICAgICAgICAgICAgICAgIHBhZ2VOdW1iZXIgKz0gMTtcblxuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIHN1YnNxdWVudCBHRVQgb2ZmZXJzIE9saXZlIFJFU1QgY2FsbFxuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZTogT2ZmZXJzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRPZmZlcnMoe1xuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHk6IE9mZmVyQXZhaWxhYmlsaXR5LkNsaWVudE9ubHksXG4gICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlOiBDb3VudHJ5Q29kZS5VcyxcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGU6IFJlZGVtcHRpb25UeXBlLkNhcmRsaW5rZWQsIC8vIG9ubHkgaW50ZXJlc3RlZCBpbiBjYXJkIGxpbmtlZCBvZmZlcnNcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyVHlwZTogT2ZmZXJGaWx0ZXIuRmlkZWxpcyxcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZXM6IFtPZmZlclN0YXRlLkFjdGl2ZSwgT2ZmZXJTdGF0ZS5TY2hlZHVsZWRdLCAvLyB3ZSB3YW50IHRvIHJldHJpZXZlIGFjdGl2ZSAocmVndWxhciBkaXNjb3VudCkgYW5kIHNjaGVkdWxlZCAoYmlydGhkYXksIGhvbGlkYXkpIG9mZmVyc1xuICAgICAgICAgICAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBwYWdlU2l6ZTogNTAgLy8gZGlzcGxheSA1MCBvZmZlcnMgYXQgYSB0aW1lICh0aGF0IHdlIHdpbGwgdGhlbiB1c2UgdG8gYWdncmVnYXRlIHRocm91Z2hvdXQgb3VyIEZpZGVsaXMgcGFydG5lcnMpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHN1YnNlcXVlbnQgb2ZmZXJzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgIGlmIChzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UgJiYgIXN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5lcnJvclR5cGUgJiYgc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgICAgICAgICAgICAgc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlBhZ2VzICE9PSB1bmRlZmluZWQgJiYgc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlJlY29yZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIEZpZGVsaXMgb2ZmZXJzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgIGZpZGVsaXNPZmZlcnMucHVzaCguLi5zdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIGEgc3Vic2VxdWVudCBnZXQgb2ZmZXJzIGNhbGwgJHtKU09OLnN0cmluZ2lmeShzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UpfSBmb3IgcGFnZSAke3BhZ2VOdW1iZXJ9IWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIG5vIG1hdGNoZWQgRmlkZWxpcyBvZmZlcnMgcmV0dXJuZWRcbiAgICAgICAgICAgIGlmIChmaWRlbGlzT2ZmZXJzIS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gRmlkZWxpcyBvZmZlcnMgdG8gZGlzcGxheSBmb3IgcGFydG5lcnMhYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCB0aGUgcmV0cmlldmVkIEZpZGVsaXMgb2ZmZXJzIGZyb20gYWxsIHJlY29yZCBwYWdlcywgYW5kIGJ1aWxkIHRoZSBGaWRlbGlzIHBhcnRuZXJzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgY29uc3QgZmlkZWxpc1BhcnRuZXJzTWFwOiBNYXA8c3RyaW5nLCBPZmZlcltdPiA9IG5ldyBNYXA8c3RyaW5nLCBPZmZlcltdPigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZGVsaXNQYXJ0bmVyczogRmlkZWxpc1BhcnRuZXJbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZpZGVsaXNPZmZlcnMhLmZvckVhY2gob2ZmZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG9mZmVyJ3MgRmlkZWxpcyBwYXJ0bmVyLCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgbWFwIGFib3ZlXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWRlbGlzUGFydG5lcnNNYXAuaGFzKG9mZmVyIS5icmFuZERiYSEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCBhbHJlYWR5IGRvZXMgZXhpc3QsIHRoZW4gYWRkIHRoZSBvZmZlciBpbiB0aGUgZWxlbWVudCdzIGxpc3Qgb2Ygb2ZmZXJzIChhcyB0aGUgdmFsdWUgZnJvbSB0aGUga2V5LHBhaXIpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1BhcnRuZXJPZmZlcnM6IE9mZmVyW10gPSBmaWRlbGlzUGFydG5lcnNNYXAuZ2V0KG9mZmVyIS5icmFuZERiYSEpITtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nUGFydG5lck9mZmVycy5wdXNoKG9mZmVyISk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWRlbGlzUGFydG5lcnNNYXAuc2V0KG9mZmVyIS5icmFuZERiYSEsIGV4aXN0aW5nUGFydG5lck9mZmVycyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCBkb2VzIG5vdCwgdGhlbiBjcmVhdGUgYSBuZXcga2V5LHZhbHVlIHBhaXIgd2l0aCB0aGlzIHBhcnRuZXIgYW5kIHRoZSBvZmZlciBvYnNlcnZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzTWFwLnNldChvZmZlciEuYnJhbmREYmEhLCBbb2ZmZXIhXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIGJ1aWxkIHRoZSBsaXN0IG9mIHBhcnRuZXJzIHRvIHJldHVyblxuICAgICAgICAgICAgICAgIGZpZGVsaXNQYXJ0bmVyc01hcC5mb3JFYWNoKChmaWRlbGlzT2ZmZXJzLCBicmFuZE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmROYW1lOiBicmFuZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBudW1iZXJPZk9mZmVyczogZmlkZWxpc09mZmVycy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnM6IGZpZGVsaXNPZmZlcnNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgRmlkZWxpcyBwYXJ0bmVycyBhbG9uZ3NpZGUgdGhlaXIgb2ZmZXJzXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZmlkZWxpc1BhcnRuZXJzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGZpcnN0IGdldCBvZmZlcnMgY2FsbCAke0pTT04uc3RyaW5naWZ5KGZpcnN0T2ZmZXJzUmVzcG9uc2UpfSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==