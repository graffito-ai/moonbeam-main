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
            /**
             * Todo: Remove this once the front-end is changed. Olive changed the type of the reward type for their enum so we're going to patch
             * this so we match with whatever we had this on the front-end before they made this breaking change.
             */
            firstOffersResponse.data.offers.forEach(retrievedOffer => {
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
                let fidelisPartnersSortedMap = new Map();
                fidelisPartnersMap.forEach((fidelisOffers, brandName) => {
                    // give a weight to the brand name depending on how we want them to show up
                    moonbeam_models_1.FidelisPartnerOrder.includes(brandName) &&
                        fidelisPartnersSortedMap.set(moonbeam_models_1.FidelisPartnerOrder.indexOf(brandName.trimStart().trimEnd()), [brandName, fidelisOffers]);
                });
                fidelisPartnersSortedMap = new Map([...fidelisPartnersSortedMap].sort((a, b) => a[0] - b[0]));
                fidelisPartnersSortedMap.forEach(([brandName, fidelisOffers]) => {
                    fidelisPartners.push({
                        brandName: brandName,
                        veteranOwned: moonbeam_models_1.FidelisVeteranOwnedPartners.includes(brandName),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RmlkZWxpc1BhcnRuZXJzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRGaWRlbGlzUGFydG5lcnNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFXbUM7QUFFbkM7Ozs7O0dBS0c7QUFDSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFtQyxFQUFFO0lBQzNGLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0dBQW9HO1FBQ3BHLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVuRSx1QkFBdUI7UUFDdkIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLDhEQUE4RDtRQUM5RCxJQUFJLGFBQWEsR0FBbUIsRUFBRSxDQUFDO1FBRXZDLCtDQUErQztRQUMvQyxNQUFNLG1CQUFtQixHQUFtQixNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUM7WUFDcEUsWUFBWSxFQUFFLG1DQUFpQixDQUFDLFVBQVU7WUFDMUMsV0FBVyxFQUFFLDZCQUFXLENBQUMsRUFBRTtZQUMzQixjQUFjLEVBQUUsZ0NBQWMsQ0FBQyxVQUFVO1lBQ3pDLFVBQVUsRUFBRSw2QkFBVyxDQUFDLE9BQU87WUFDL0IsV0FBVyxFQUFFLENBQUMsNEJBQVUsQ0FBQyxNQUFNLEVBQUUsNEJBQVUsQ0FBQyxTQUFTLENBQUM7WUFDdEQsVUFBVSxFQUFFLFVBQVU7WUFDdEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxtR0FBbUc7U0FDbkgsQ0FBQyxDQUFDO1FBRUgsa0VBQWtFO1FBQ2xFLElBQUksbUJBQW1CLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLElBQUksQ0FBQyxtQkFBbUIs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QUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO1NBQzdDLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTNKWSxRQUFBLGtCQUFrQixzQkEySjlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBGaWRlbGlzUGFydG5lcixcbiAgICBGaWRlbGlzUGFydG5lclJlc3BvbnNlLFxuICAgIE1heWJlLFxuICAgIE9mZmVyLFxuICAgIE9mZmVyc0Vycm9yVHlwZSxcbiAgICBPZmZlcnNSZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudCxcbiAgICBSZWRlbXB0aW9uVHlwZSxcbiAgICBDb3VudHJ5Q29kZSwgT2ZmZXJBdmFpbGFiaWxpdHksIE9mZmVyRmlsdGVyLCBPZmZlclN0YXRlLCBGaWRlbGlzUGFydG5lck9yZGVyLFxuICAgIEZpZGVsaXNWZXRlcmFuT3duZWRQYXJ0bmVycywgUmV3YXJkVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldEZpZGVsaXNQYXJ0bmVycyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE9mZmVyc1Jlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0RmlkZWxpc1BhcnRuZXJzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nKTogUHJvbWlzZTxGaWRlbGlzUGFydG5lclJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgLy8gd2Ugc3RhcnQgd2l0aCBwYWdlIDFcbiAgICAgICAgbGV0IHBhZ2VOdW1iZXIgPSAxO1xuXG4gICAgICAgIC8vIGNvbnN0YW50IHVzZWQgdG8ga2VlcCB0cmFjayBvZiB0aGUgRmlkZWxpcyBvZmZlcnMgcmV0cmlldmVkXG4gICAgICAgIGxldCBmaWRlbGlzT2ZmZXJzOiBNYXliZTxPZmZlcj5bXSA9IFtdO1xuXG4gICAgICAgIC8vIGV4ZWN1dGUgdGhlIGZpcnN0IEdFVCBvZmZlcnMgT2xpdmUgUkVTVCBjYWxsXG4gICAgICAgIGNvbnN0IGZpcnN0T2ZmZXJzUmVzcG9uc2U6IE9mZmVyc1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0T2ZmZXJzKHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogT2ZmZXJBdmFpbGFiaWxpdHkuQ2xpZW50T25seSxcbiAgICAgICAgICAgIGNvdW50cnlDb2RlOiBDb3VudHJ5Q29kZS5VcyxcbiAgICAgICAgICAgIHJlZGVtcHRpb25UeXBlOiBSZWRlbXB0aW9uVHlwZS5DYXJkbGlua2VkLCAvLyBvbmx5IGludGVyZXN0ZWQgaW4gY2FyZCBsaW5rZWQgb2ZmZXJzXG4gICAgICAgICAgICBmaWx0ZXJUeXBlOiBPZmZlckZpbHRlci5GaWRlbGlzLFxuICAgICAgICAgICAgb2ZmZXJTdGF0ZXM6IFtPZmZlclN0YXRlLkFjdGl2ZSwgT2ZmZXJTdGF0ZS5TY2hlZHVsZWRdLCAvLyB3ZSB3YW50IHRvIHJldHJpZXZlIGFjdGl2ZSAocmVndWxhciBkaXNjb3VudCkgYW5kIHNjaGVkdWxlZCAoYmlydGhkYXksIGhvbGlkYXkpIG9mZmVyc1xuICAgICAgICAgICAgcGFnZU51bWJlcjogcGFnZU51bWJlcixcbiAgICAgICAgICAgIHBhZ2VTaXplOiA1MCAvLyBkaXNwbGF5IDUwIG9mZmVycyBhdCBhIHRpbWUgKHRoYXQgd2Ugd2lsbCB0aGVuIHVzZSB0byBhZ2dyZWdhdGUgdGhyb3VnaG91dCBvdXIgRmlkZWxpcyBwYXJ0bmVycylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBmaXJzdCBvZmZlcnMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgIGlmIChmaXJzdE9mZmVyc1Jlc3BvbnNlICYmICFmaXJzdE9mZmVyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhZmlyc3RPZmZlcnNSZXNwb25zZS5lcnJvclR5cGUgJiYgZmlyc3RPZmZlcnNSZXNwb25zZS5kYXRhICYmXG4gICAgICAgICAgICBmaXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlBhZ2VzICYmIGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAmJiBmaXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzKSB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVG9kbzogUmVtb3ZlIHRoaXMgb25jZSB0aGUgZnJvbnQtZW5kIGlzIGNoYW5nZWQuIE9saXZlIGNoYW5nZWQgdGhlIHR5cGUgb2YgdGhlIHJld2FyZCB0eXBlIGZvciB0aGVpciBlbnVtIHNvIHdlJ3JlIGdvaW5nIHRvIHBhdGNoXG4gICAgICAgICAgICAgKiB0aGlzIHNvIHdlIG1hdGNoIHdpdGggd2hhdGV2ZXIgd2UgaGFkIHRoaXMgb24gdGhlIGZyb250LWVuZCBiZWZvcmUgdGhleSBtYWRlIHRoaXMgYnJlYWtpbmcgY2hhbmdlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmaXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzLmZvckVhY2gocmV0cmlldmVkT2ZmZXIgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRPZmZlciAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyLnJld2FyZCAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUgIT09IHVuZGVmaW5lZCAmJiByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIHN3aXRjaCBGaXhlZCB0byBSZXdhcmRBbW91bnQgYW5kXG4gICAgICAgICAgICAgICAgICAgICAqIHN3aXRjaCBQZXJjZW50YWdlIHRvIFJld2FyZFBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID09PSBSZXdhcmRUeXBlLlBlcmNlbnRhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPSBSZXdhcmRUeXBlLlJld2FyZFBlcmNlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPT09IFJld2FyZFR5cGUuRml4ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPSBSZXdhcmRUeXBlLlJld2FyZEFtb3VudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBzZXQgdGhlIEZpZGVsaXMgb2ZmZXJzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBmaWRlbGlzT2ZmZXJzLnB1c2goLi4uZmlyc3RPZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyk7XG5cbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgYXMgbWFueSBjYWxscyBhcyB0aGUgbnVtYmVyIG9mIHJlbWFpbmluZyBwYWdlcyAoaW4gb3JkZXIgdG8gZ2V0IGFsbCBGaWRlbGlzIG9mZmVycylcbiAgICAgICAgICAgIGxldCByZW1haW5pbmdQYWdlcyA9IGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUGFnZXMgLSBwYWdlTnVtYmVyO1xuICAgICAgICAgICAgd2hpbGUgKHJlbWFpbmluZ1BhZ2VzID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNlIHBhZ2VOdW1iZXJcbiAgICAgICAgICAgICAgICBwYWdlTnVtYmVyICs9IDE7XG5cbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBzdWJzZXF1ZW50IEdFVCBvZmZlcnMgT2xpdmUgUkVTVCBjYWxsXG4gICAgICAgICAgICAgICAgY29uc3Qgc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlOiBPZmZlcnNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE9mZmVycyh7XG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogT2ZmZXJBdmFpbGFiaWxpdHkuQ2xpZW50T25seSxcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IENvdW50cnlDb2RlLlVzLFxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHlwZTogUmVkZW1wdGlvblR5cGUuQ2FyZGxpbmtlZCwgLy8gb25seSBpbnRlcmVzdGVkIGluIGNhcmQgbGlua2VkIG9mZmVyc1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJUeXBlOiBPZmZlckZpbHRlci5GaWRlbGlzLFxuICAgICAgICAgICAgICAgICAgICBvZmZlclN0YXRlczogW09mZmVyU3RhdGUuQWN0aXZlLCBPZmZlclN0YXRlLlNjaGVkdWxlZF0sIC8vIHdlIHdhbnQgdG8gcmV0cmlldmUgYWN0aXZlIChyZWd1bGFyIGRpc2NvdW50KSBhbmQgc2NoZWR1bGVkIChiaXJ0aGRheSwgaG9saWRheSkgb2ZmZXJzXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2VOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VTaXplOiA1MCAvLyBkaXNwbGF5IDUwIG9mZmVycyBhdCBhIHRpbWUgKHRoYXQgd2Ugd2lsbCB0aGVuIHVzZSB0byBhZ2dyZWdhdGUgdGhyb3VnaG91dCBvdXIgRmlkZWxpcyBwYXJ0bmVycylcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgc3Vic2VxdWVudCBvZmZlcnMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgaWYgKHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZSAmJiAhc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICAgICAgICAgICAgICBzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUGFnZXMgIT09IHVuZGVmaW5lZCAmJiBzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgRmlkZWxpcyBvZmZlcnMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgZmlkZWxpc09mZmVycy5wdXNoKC4uLnN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gYSBzdWJzZXF1ZW50IGdldCBvZmZlcnMgY2FsbCAke0pTT04uc3RyaW5naWZ5KHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZSl9IGZvciBwYWdlICR7cGFnZU51bWJlcn0hYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgbm8gbWF0Y2hlZCBGaWRlbGlzIG9mZmVycyByZXR1cm5lZFxuICAgICAgICAgICAgaWYgKGZpZGVsaXNPZmZlcnMhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyBGaWRlbGlzIG9mZmVycyB0byBkaXNwbGF5IGZvciBwYXJ0bmVycyFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBnbyB0aHJvdWdoIHRoZSByZXRyaWV2ZWQgRmlkZWxpcyBvZmZlcnMgZnJvbSBhbGwgcmVjb3JkIHBhZ2VzLCBhbmQgYnVpbGQgdGhlIEZpZGVsaXMgcGFydG5lcnMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICBjb25zdCBmaWRlbGlzUGFydG5lcnNNYXA6IE1hcDxzdHJpbmcsIE9mZmVyW10+ID0gbmV3IE1hcDxzdHJpbmcsIE9mZmVyW10+KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlkZWxpc1BhcnRuZXJzOiBGaWRlbGlzUGFydG5lcltdID0gW107XG4gICAgICAgICAgICAgICAgZmlkZWxpc09mZmVycyEuZm9yRWFjaChvZmZlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgb2ZmZXIncyBGaWRlbGlzIHBhcnRuZXIsIGFscmVhZHkgZXhpc3RzIGluIHRoZSBtYXAgYWJvdmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpZGVsaXNQYXJ0bmVyc01hcC5oYXMob2ZmZXIhLmJyYW5kRGJhISkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGFscmVhZHkgZG9lcyBleGlzdCwgdGhlbiBhZGQgdGhlIG9mZmVyIGluIHRoZSBlbGVtZW50J3MgbGlzdCBvZiBvZmZlcnMgKGFzIHRoZSB2YWx1ZSBmcm9tIHRoZSBrZXkscGFpcilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUGFydG5lck9mZmVyczogT2ZmZXJbXSA9IGZpZGVsaXNQYXJ0bmVyc01hcC5nZXQob2ZmZXIhLmJyYW5kRGJhISkhO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdQYXJ0bmVyT2ZmZXJzLnB1c2gob2ZmZXIhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZGVsaXNQYXJ0bmVyc01hcC5zZXQob2ZmZXIhLmJyYW5kRGJhISwgZXhpc3RpbmdQYXJ0bmVyT2ZmZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGRvZXMgbm90LCB0aGVuIGNyZWF0ZSBhIG5ldyBrZXksdmFsdWUgcGFpciB3aXRoIHRoaXMgcGFydG5lciBhbmQgdGhlIG9mZmVyIG9ic2VydmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWRlbGlzUGFydG5lcnNNYXAuc2V0KG9mZmVyIS5icmFuZERiYSEsIFtvZmZlciFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gYnVpbGQgdGhlIGxpc3Qgb2YgcGFydG5lcnMgdG8gcmV0dXJuXG4gICAgICAgICAgICAgICAgbGV0IGZpZGVsaXNQYXJ0bmVyc1NvcnRlZE1hcDogTWFwPG51bWJlcixbc3RyaW5nLCBPZmZlcltdXT4gPSBuZXcgTWFwPG51bWJlciwgW3N0cmluZywgT2ZmZXJbXV0+KCk7XG4gICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzTWFwLmZvckVhY2goKGZpZGVsaXNPZmZlcnMsIGJyYW5kTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBnaXZlIGEgd2VpZ2h0IHRvIHRoZSBicmFuZCBuYW1lIGRlcGVuZGluZyBvbiBob3cgd2Ugd2FudCB0aGVtIHRvIHNob3cgdXBcbiAgICAgICAgICAgICAgICAgICAgRmlkZWxpc1BhcnRuZXJPcmRlci5pbmNsdWRlcyhicmFuZE5hbWUpICYmXG4gICAgICAgICAgICAgICAgICAgIGZpZGVsaXNQYXJ0bmVyc1NvcnRlZE1hcC5zZXQoRmlkZWxpc1BhcnRuZXJPcmRlci5pbmRleE9mKGJyYW5kTmFtZS50cmltU3RhcnQoKS50cmltRW5kKCkpLCBbYnJhbmROYW1lLCBmaWRlbGlzT2ZmZXJzXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzU29ydGVkTWFwID0gbmV3IE1hcChbLi4uZmlkZWxpc1BhcnRuZXJzU29ydGVkTWFwXS5zb3J0KChhLCBiKSA9PiBhWzBdIC0gYlswXSkpO1xuXG4gICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzU29ydGVkTWFwLmZvckVhY2goKFticmFuZE5hbWUsIGZpZGVsaXNPZmZlcnNdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpZGVsaXNQYXJ0bmVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kTmFtZTogYnJhbmROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmV0ZXJhbk93bmVkOiBGaWRlbGlzVmV0ZXJhbk93bmVkUGFydG5lcnMuaW5jbHVkZXMoYnJhbmROYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlck9mT2ZmZXJzOiBmaWRlbGlzT2ZmZXJzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyczogZmlkZWxpc09mZmVyc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbGlzdCBvZiBGaWRlbGlzIHBhcnRuZXJzIGFsb25nc2lkZSB0aGVpciBvZmZlcnNcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBmaWRlbGlzUGFydG5lcnNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgZmlyc3QgZ2V0IG9mZmVycyBjYWxsICR7SlNPTi5zdHJpbmdpZnkoZmlyc3RPZmZlcnNSZXNwb25zZSl9IWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19