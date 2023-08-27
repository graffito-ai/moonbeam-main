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
                // execute the subsequent GET offers Olive REST call
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RmlkZWxpc1BhcnRuZXJzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRGaWRlbGlzUGFydG5lcnNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFVbUM7QUFFbkM7Ozs7O0dBS0c7QUFDSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFtQyxFQUFFO0lBQzNGLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0dBQW9HO1FBQ3BHLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVuRSx1QkFBdUI7UUFDdkIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLDhEQUE4RDtRQUM5RCxJQUFJLGFBQWEsR0FBbUIsRUFBRSxDQUFDO1FBRXZDLCtDQUErQztRQUMvQyxNQUFNLG1CQUFtQixHQUFtQixNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUM7WUFDcEUsWUFBWSxFQUFFLG1DQUFpQixDQUFDLFVBQVU7WUFDMUMsV0FBVyxFQUFFLDZCQUFXLENBQUMsRUFBRTtZQUMzQixjQUFjLEVBQUUsZ0NBQWMsQ0FBQyxVQUFVO1lBQ3pDLFVBQVUsRUFBRSw2QkFBVyxDQUFDLE9BQU87WUFDL0IsV0FBVyxFQUFFLENBQUMsNEJBQVUsQ0FBQyxNQUFNLEVBQUUsNEJBQVUsQ0FBQyxTQUFTLENBQUM7WUFDdEQsVUFBVSxFQUFFLFVBQVU7WUFDdEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxtR0FBbUc7U0FDbkgsQ0FBQyxDQUFDO1FBRUgsa0VBQWtFO1FBQ2xFLElBQUksbUJBQW1CLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLElBQUksQ0FBQyxtQkFBbUIs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O0tBQ0w7QUFDTCxDQUFDLENBQUE7QUE1SFksUUFBQSxrQkFBa0Isc0JBNEg5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgRmlkZWxpc1BhcnRuZXIsXG4gICAgRmlkZWxpc1BhcnRuZXJSZXNwb25zZSxcbiAgICBNYXliZSxcbiAgICBPZmZlcixcbiAgICBPZmZlcnNFcnJvclR5cGUsXG4gICAgT2ZmZXJzUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgUmVkZW1wdGlvblR5cGUsXG4gICAgQ291bnRyeUNvZGUsIE9mZmVyQXZhaWxhYmlsaXR5LCBPZmZlckZpbHRlciwgT2ZmZXJTdGF0ZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldEZpZGVsaXNQYXJ0bmVycyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE9mZmVyc1Jlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0RmlkZWxpc1BhcnRuZXJzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nKTogUHJvbWlzZTxGaWRlbGlzUGFydG5lclJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgLy8gd2Ugc3RhcnQgd2l0aCBwYWdlIDFcbiAgICAgICAgbGV0IHBhZ2VOdW1iZXIgPSAxO1xuXG4gICAgICAgIC8vIGNvbnN0YW50IHVzZWQgdG8ga2VlcCB0cmFjayBvZiB0aGUgRmlkZWxpcyBvZmZlcnMgcmV0cmlldmVkXG4gICAgICAgIGxldCBmaWRlbGlzT2ZmZXJzOiBNYXliZTxPZmZlcj5bXSA9IFtdO1xuXG4gICAgICAgIC8vIGV4ZWN1dGUgdGhlIGZpcnN0IEdFVCBvZmZlcnMgT2xpdmUgUkVTVCBjYWxsXG4gICAgICAgIGNvbnN0IGZpcnN0T2ZmZXJzUmVzcG9uc2U6IE9mZmVyc1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0T2ZmZXJzKHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogT2ZmZXJBdmFpbGFiaWxpdHkuQ2xpZW50T25seSxcbiAgICAgICAgICAgIGNvdW50cnlDb2RlOiBDb3VudHJ5Q29kZS5VcyxcbiAgICAgICAgICAgIHJlZGVtcHRpb25UeXBlOiBSZWRlbXB0aW9uVHlwZS5DYXJkbGlua2VkLCAvLyBvbmx5IGludGVyZXN0ZWQgaW4gY2FyZCBsaW5rZWQgb2ZmZXJzXG4gICAgICAgICAgICBmaWx0ZXJUeXBlOiBPZmZlckZpbHRlci5GaWRlbGlzLFxuICAgICAgICAgICAgb2ZmZXJTdGF0ZXM6IFtPZmZlclN0YXRlLkFjdGl2ZSwgT2ZmZXJTdGF0ZS5TY2hlZHVsZWRdLCAvLyB3ZSB3YW50IHRvIHJldHJpZXZlIGFjdGl2ZSAocmVndWxhciBkaXNjb3VudCkgYW5kIHNjaGVkdWxlZCAoYmlydGhkYXksIGhvbGlkYXkpIG9mZmVyc1xuICAgICAgICAgICAgcGFnZU51bWJlcjogcGFnZU51bWJlcixcbiAgICAgICAgICAgIHBhZ2VTaXplOiA1MCAvLyBkaXNwbGF5IDUwIG9mZmVycyBhdCBhIHRpbWUgKHRoYXQgd2Ugd2lsbCB0aGVuIHVzZSB0byBhZ2dyZWdhdGUgdGhyb3VnaG91dCBvdXIgRmlkZWxpcyBwYXJ0bmVycylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBmaXJzdCBvZmZlcnMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgIGlmIChmaXJzdE9mZmVyc1Jlc3BvbnNlICYmICFmaXJzdE9mZmVyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhZmlyc3RPZmZlcnNSZXNwb25zZS5lcnJvclR5cGUgJiYgZmlyc3RPZmZlcnNSZXNwb25zZS5kYXRhICYmXG4gICAgICAgICAgICBmaXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlBhZ2VzICYmIGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAmJiBmaXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzKSB7XG4gICAgICAgICAgICAvLyBzZXQgdGhlIEZpZGVsaXMgb2ZmZXJzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBmaWRlbGlzT2ZmZXJzLnB1c2goLi4uZmlyc3RPZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyk7XG5cbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgYXMgbWFueSBjYWxscyBhcyB0aGUgbnVtYmVyIG9mIHJlbWFpbmluZyBwYWdlcyAoaW4gb3JkZXIgdG8gZ2V0IGFsbCBGaWRlbGlzIG9mZmVycylcbiAgICAgICAgICAgIGxldCByZW1haW5pbmdQYWdlcyA9IGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUGFnZXMgLSBwYWdlTnVtYmVyO1xuICAgICAgICAgICAgd2hpbGUgKHJlbWFpbmluZ1BhZ2VzID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNlIHBhZ2VOdW1iZXJcbiAgICAgICAgICAgICAgICBwYWdlTnVtYmVyICs9IDE7XG5cbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBzdWJzZXF1ZW50IEdFVCBvZmZlcnMgT2xpdmUgUkVTVCBjYWxsXG4gICAgICAgICAgICAgICAgY29uc3Qgc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlOiBPZmZlcnNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE9mZmVycyh7XG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogT2ZmZXJBdmFpbGFiaWxpdHkuQ2xpZW50T25seSxcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IENvdW50cnlDb2RlLlVzLFxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHlwZTogUmVkZW1wdGlvblR5cGUuQ2FyZGxpbmtlZCwgLy8gb25seSBpbnRlcmVzdGVkIGluIGNhcmQgbGlua2VkIG9mZmVyc1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJUeXBlOiBPZmZlckZpbHRlci5GaWRlbGlzLFxuICAgICAgICAgICAgICAgICAgICBvZmZlclN0YXRlczogW09mZmVyU3RhdGUuQWN0aXZlLCBPZmZlclN0YXRlLlNjaGVkdWxlZF0sIC8vIHdlIHdhbnQgdG8gcmV0cmlldmUgYWN0aXZlIChyZWd1bGFyIGRpc2NvdW50KSBhbmQgc2NoZWR1bGVkIChiaXJ0aGRheSwgaG9saWRheSkgb2ZmZXJzXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2VOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VTaXplOiA1MCAvLyBkaXNwbGF5IDUwIG9mZmVycyBhdCBhIHRpbWUgKHRoYXQgd2Ugd2lsbCB0aGVuIHVzZSB0byBhZ2dyZWdhdGUgdGhyb3VnaG91dCBvdXIgRmlkZWxpcyBwYXJ0bmVycylcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgc3Vic2VxdWVudCBvZmZlcnMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgaWYgKHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZSAmJiAhc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICAgICAgICAgICAgICBzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUGFnZXMgIT09IHVuZGVmaW5lZCAmJiBzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgRmlkZWxpcyBvZmZlcnMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgZmlkZWxpc09mZmVycy5wdXNoKC4uLnN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gYSBzdWJzZXF1ZW50IGdldCBvZmZlcnMgY2FsbCAke0pTT04uc3RyaW5naWZ5KHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZSl9IGZvciBwYWdlICR7cGFnZU51bWJlcn0hYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgbm8gbWF0Y2hlZCBGaWRlbGlzIG9mZmVycyByZXR1cm5lZFxuICAgICAgICAgICAgaWYgKGZpZGVsaXNPZmZlcnMhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyBGaWRlbGlzIG9mZmVycyB0byBkaXNwbGF5IGZvciBwYXJ0bmVycyFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBnbyB0aHJvdWdoIHRoZSByZXRyaWV2ZWQgRmlkZWxpcyBvZmZlcnMgZnJvbSBhbGwgcmVjb3JkIHBhZ2VzLCBhbmQgYnVpbGQgdGhlIEZpZGVsaXMgcGFydG5lcnMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICBjb25zdCBmaWRlbGlzUGFydG5lcnNNYXA6IE1hcDxzdHJpbmcsIE9mZmVyW10+ID0gbmV3IE1hcDxzdHJpbmcsIE9mZmVyW10+KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlkZWxpc1BhcnRuZXJzOiBGaWRlbGlzUGFydG5lcltdID0gW107XG4gICAgICAgICAgICAgICAgZmlkZWxpc09mZmVycyEuZm9yRWFjaChvZmZlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgb2ZmZXIncyBGaWRlbGlzIHBhcnRuZXIsIGFscmVhZHkgZXhpc3RzIGluIHRoZSBtYXAgYWJvdmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpZGVsaXNQYXJ0bmVyc01hcC5oYXMob2ZmZXIhLmJyYW5kRGJhISkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGFscmVhZHkgZG9lcyBleGlzdCwgdGhlbiBhZGQgdGhlIG9mZmVyIGluIHRoZSBlbGVtZW50J3MgbGlzdCBvZiBvZmZlcnMgKGFzIHRoZSB2YWx1ZSBmcm9tIHRoZSBrZXkscGFpcilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUGFydG5lck9mZmVyczogT2ZmZXJbXSA9IGZpZGVsaXNQYXJ0bmVyc01hcC5nZXQob2ZmZXIhLmJyYW5kRGJhISkhO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdQYXJ0bmVyT2ZmZXJzLnB1c2gob2ZmZXIhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZGVsaXNQYXJ0bmVyc01hcC5zZXQob2ZmZXIhLmJyYW5kRGJhISwgZXhpc3RpbmdQYXJ0bmVyT2ZmZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGRvZXMgbm90LCB0aGVuIGNyZWF0ZSBhIG5ldyBrZXksdmFsdWUgcGFpciB3aXRoIHRoaXMgcGFydG5lciBhbmQgdGhlIG9mZmVyIG9ic2VydmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWRlbGlzUGFydG5lcnNNYXAuc2V0KG9mZmVyIS5icmFuZERiYSEsIFtvZmZlciFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gYnVpbGQgdGhlIGxpc3Qgb2YgcGFydG5lcnMgdG8gcmV0dXJuXG4gICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzTWFwLmZvckVhY2goKGZpZGVsaXNPZmZlcnMsIGJyYW5kTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaWRlbGlzUGFydG5lcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuZE5hbWU6IGJyYW5kTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlck9mT2ZmZXJzOiBmaWRlbGlzT2ZmZXJzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyczogZmlkZWxpc09mZmVyc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbGlzdCBvZiBGaWRlbGlzIHBhcnRuZXJzIGFsb25nc2lkZSB0aGVpciBvZmZlcnNcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBmaWRlbGlzUGFydG5lcnNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgZmlyc3QgZ2V0IG9mZmVycyBjYWxsICR7SlNPTi5zdHJpbmdpZnkoZmlyc3RPZmZlcnNSZXNwb25zZSl9IWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19