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
        }, 3);
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
                }, 3);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RmlkZWxpc1BhcnRuZXJzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRGaWRlbGlzUGFydG5lcnNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFXbUM7QUFFbkM7Ozs7O0dBS0c7QUFDSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFtQyxFQUFFO0lBQzNGLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsb0dBQW9HO1FBQ3BHLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVuRSx1QkFBdUI7UUFDdkIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLDhEQUE4RDtRQUM5RCxJQUFJLGFBQWEsR0FBbUIsRUFBRSxDQUFDO1FBRXZDLCtDQUErQztRQUMvQyxNQUFNLG1CQUFtQixHQUFtQixNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUM7WUFDcEUsWUFBWSxFQUFFLG1DQUFpQixDQUFDLFVBQVU7WUFDMUMsV0FBVyxFQUFFLDZCQUFXLENBQUMsRUFBRTtZQUMzQixjQUFjLEVBQUUsZ0NBQWMsQ0FBQyxVQUFVO1lBQ3pDLFVBQVUsRUFBRSw2QkFBVyxDQUFDLE9BQU87WUFDL0IsV0FBVyxFQUFFLENBQUMsNEJBQVUsQ0FBQyxNQUFNLEVBQUUsNEJBQVUsQ0FBQyxTQUFTLENBQUM7WUFDdEQsVUFBVSxFQUFFLFVBQVU7WUFDdEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxtR0FBbUc7U0FDbkgsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVOLGtFQUFrRTtRQUNsRSxJQUFJLG1CQUFtQixJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxJQUFJLENB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QVksRUFBRSxZQUFZO2FBQzdCLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxpQ0FBZSxDQUFDLGVBQWU7U0FDN0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBM0pZLFFBQUEsa0JBQWtCLHNCQTJKOUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEZpZGVsaXNQYXJ0bmVyLFxuICAgIEZpZGVsaXNQYXJ0bmVyUmVzcG9uc2UsXG4gICAgTWF5YmUsXG4gICAgT2ZmZXIsXG4gICAgT2ZmZXJzRXJyb3JUeXBlLFxuICAgIE9mZmVyc1Jlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LFxuICAgIFJlZGVtcHRpb25UeXBlLFxuICAgIENvdW50cnlDb2RlLCBPZmZlckF2YWlsYWJpbGl0eSwgT2ZmZXJGaWx0ZXIsIE9mZmVyU3RhdGUsIEZpZGVsaXNQYXJ0bmVyT3JkZXIsXG4gICAgRmlkZWxpc1ZldGVyYW5Pd25lZFBhcnRuZXJzLCBSZXdhcmRUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0RmlkZWxpc1BhcnRuZXJzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgT2ZmZXJzUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRGaWRlbGlzUGFydG5lcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEZpZGVsaXNQYXJ0bmVyUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAvLyB3ZSBzdGFydCB3aXRoIHBhZ2UgMVxuICAgICAgICBsZXQgcGFnZU51bWJlciA9IDE7XG5cbiAgICAgICAgLy8gY29uc3RhbnQgdXNlZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBGaWRlbGlzIG9mZmVycyByZXRyaWV2ZWRcbiAgICAgICAgbGV0IGZpZGVsaXNPZmZlcnM6IE1heWJlPE9mZmVyPltdID0gW107XG5cbiAgICAgICAgLy8gZXhlY3V0ZSB0aGUgZmlyc3QgR0VUIG9mZmVycyBPbGl2ZSBSRVNUIGNhbGxcbiAgICAgICAgY29uc3QgZmlyc3RPZmZlcnNSZXNwb25zZTogT2ZmZXJzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRPZmZlcnMoe1xuICAgICAgICAgICAgYXZhaWxhYmlsaXR5OiBPZmZlckF2YWlsYWJpbGl0eS5DbGllbnRPbmx5LFxuICAgICAgICAgICAgY291bnRyeUNvZGU6IENvdW50cnlDb2RlLlVzLFxuICAgICAgICAgICAgcmVkZW1wdGlvblR5cGU6IFJlZGVtcHRpb25UeXBlLkNhcmRsaW5rZWQsIC8vIG9ubHkgaW50ZXJlc3RlZCBpbiBjYXJkIGxpbmtlZCBvZmZlcnNcbiAgICAgICAgICAgIGZpbHRlclR5cGU6IE9mZmVyRmlsdGVyLkZpZGVsaXMsXG4gICAgICAgICAgICBvZmZlclN0YXRlczogW09mZmVyU3RhdGUuQWN0aXZlLCBPZmZlclN0YXRlLlNjaGVkdWxlZF0sIC8vIHdlIHdhbnQgdG8gcmV0cmlldmUgYWN0aXZlIChyZWd1bGFyIGRpc2NvdW50KSBhbmQgc2NoZWR1bGVkIChiaXJ0aGRheSwgaG9saWRheSkgb2ZmZXJzXG4gICAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlTnVtYmVyLFxuICAgICAgICAgICAgcGFnZVNpemU6IDUwIC8vIGRpc3BsYXkgNTAgb2ZmZXJzIGF0IGEgdGltZSAodGhhdCB3ZSB3aWxsIHRoZW4gdXNlIHRvIGFnZ3JlZ2F0ZSB0aHJvdWdob3V0IG91ciBGaWRlbGlzIHBhcnRuZXJzKVxuICAgICAgICB9LCAzKTtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGZpcnN0IG9mZmVycyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgaWYgKGZpcnN0T2ZmZXJzUmVzcG9uc2UgJiYgIWZpcnN0T2ZmZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFmaXJzdE9mZmVyc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBmaXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgICAgIGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUGFnZXMgJiYgZmlyc3RPZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZSZWNvcmRzICYmIGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMpIHtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUb2RvOiBSZW1vdmUgdGhpcyBvbmNlIHRoZSBmcm9udC1lbmQgaXMgY2hhbmdlZC4gT2xpdmUgY2hhbmdlZCB0aGUgdHlwZSBvZiB0aGUgcmV3YXJkIHR5cGUgZm9yIHRoZWlyIGVudW0gc28gd2UncmUgZ29pbmcgdG8gcGF0Y2hcbiAgICAgICAgICAgICAqIHRoaXMgc28gd2UgbWF0Y2ggd2l0aCB3aGF0ZXZlciB3ZSBoYWQgdGhpcyBvbiB0aGUgZnJvbnQtZW5kIGJlZm9yZSB0aGV5IG1hZGUgdGhpcyBicmVha2luZyBjaGFuZ2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZpcnN0T2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMuZm9yRWFjaChyZXRyaWV2ZWRPZmZlciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIucmV3YXJkICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogc3dpdGNoIEZpeGVkIHRvIFJld2FyZEFtb3VudCBhbmRcbiAgICAgICAgICAgICAgICAgICAgICogc3dpdGNoIFBlcmNlbnRhZ2UgdG8gUmV3YXJkUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPT09IFJld2FyZFR5cGUuUGVyY2VudGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9IFJld2FyZFR5cGUuUmV3YXJkUGVyY2VudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9PT0gUmV3YXJkVHlwZS5GaXhlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlISA9IFJld2FyZFR5cGUuUmV3YXJkQW1vdW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHNldCB0aGUgRmlkZWxpcyBvZmZlcnMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGZpZGVsaXNPZmZlcnMucHVzaCguLi5maXJzdE9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzKTtcblxuICAgICAgICAgICAgLy8gZXhlY3V0ZSBhcyBtYW55IGNhbGxzIGFzIHRoZSBudW1iZXIgb2YgcmVtYWluaW5nIHBhZ2VzIChpbiBvcmRlciB0byBnZXQgYWxsIEZpZGVsaXMgb2ZmZXJzKVxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ1BhZ2VzID0gZmlyc3RPZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZQYWdlcyAtIHBhZ2VOdW1iZXI7XG4gICAgICAgICAgICB3aGlsZSAocmVtYWluaW5nUGFnZXMgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gaW5jcmVhc2UgcGFnZU51bWJlclxuICAgICAgICAgICAgICAgIHBhZ2VOdW1iZXIgKz0gMTtcblxuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIHN1YnNlcXVlbnQgR0VUIG9mZmVycyBPbGl2ZSBSRVNUIGNhbGxcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2U6IE9mZmVyc1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0T2ZmZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5OiBPZmZlckF2YWlsYWJpbGl0eS5DbGllbnRPbmx5LFxuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogQ291bnRyeUNvZGUuVXMsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UeXBlOiBSZWRlbXB0aW9uVHlwZS5DYXJkbGlua2VkLCAvLyBvbmx5IGludGVyZXN0ZWQgaW4gY2FyZCBsaW5rZWQgb2ZmZXJzXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlclR5cGU6IE9mZmVyRmlsdGVyLkZpZGVsaXMsXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyU3RhdGVzOiBbT2ZmZXJTdGF0ZS5BY3RpdmUsIE9mZmVyU3RhdGUuU2NoZWR1bGVkXSwgLy8gd2Ugd2FudCB0byByZXRyaWV2ZSBhY3RpdmUgKHJlZ3VsYXIgZGlzY291bnQpIGFuZCBzY2hlZHVsZWQgKGJpcnRoZGF5LCBob2xpZGF5KSBvZmZlcnNcbiAgICAgICAgICAgICAgICAgICAgcGFnZU51bWJlcjogcGFnZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgcGFnZVNpemU6IDUwIC8vIGRpc3BsYXkgNTAgb2ZmZXJzIGF0IGEgdGltZSAodGhhdCB3ZSB3aWxsIHRoZW4gdXNlIHRvIGFnZ3JlZ2F0ZSB0aHJvdWdob3V0IG91ciBGaWRlbGlzIHBhcnRuZXJzKVxuICAgICAgICAgICAgICAgIH0sIDMpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBzdWJzZXF1ZW50IG9mZmVycyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlICYmICFzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFzdWJzZXF1ZW50T2ZmZXJzUmVzcG9uc2UuZXJyb3JUeXBlICYmIHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5kYXRhICYmXG4gICAgICAgICAgICAgICAgICAgIHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZQYWdlcyAhPT0gdW5kZWZpbmVkICYmIHN1YnNlcXVlbnRPZmZlcnNSZXNwb25zZS5kYXRhLnRvdGFsTnVtYmVyT2ZSZWNvcmRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBGaWRlbGlzIG9mZmVycyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICBmaWRlbGlzT2ZmZXJzLnB1c2goLi4uc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSBhIHN1YnNlcXVlbnQgZ2V0IG9mZmVycyBjYWxsICR7SlNPTi5zdHJpbmdpZnkoc3Vic2VxdWVudE9mZmVyc1Jlc3BvbnNlKX0gZm9yIHBhZ2UgJHtwYWdlTnVtYmVyfSFgO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBubyBtYXRjaGVkIEZpZGVsaXMgb2ZmZXJzIHJldHVybmVkXG4gICAgICAgICAgICBpZiAoZmlkZWxpc09mZmVycyEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIEZpZGVsaXMgb2ZmZXJzIHRvIGRpc3BsYXkgZm9yIHBhcnRuZXJzIWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggdGhlIHJldHJpZXZlZCBGaWRlbGlzIG9mZmVycyBmcm9tIGFsbCByZWNvcmQgcGFnZXMsIGFuZCBidWlsZCB0aGUgRmlkZWxpcyBwYXJ0bmVycyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZGVsaXNQYXJ0bmVyc01hcDogTWFwPHN0cmluZywgT2ZmZXJbXT4gPSBuZXcgTWFwPHN0cmluZywgT2ZmZXJbXT4oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWRlbGlzUGFydG5lcnM6IEZpZGVsaXNQYXJ0bmVyW10gPSBbXTtcbiAgICAgICAgICAgICAgICBmaWRlbGlzT2ZmZXJzIS5mb3JFYWNoKG9mZmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBvZmZlcidzIEZpZGVsaXMgcGFydG5lciwgYWxyZWFkeSBleGlzdHMgaW4gdGhlIG1hcCBhYm92ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlkZWxpc1BhcnRuZXJzTWFwLmhhcyhvZmZlciEuYnJhbmREYmEhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQgYWxyZWFkeSBkb2VzIGV4aXN0LCB0aGVuIGFkZCB0aGUgb2ZmZXIgaW4gdGhlIGVsZW1lbnQncyBsaXN0IG9mIG9mZmVycyAoYXMgdGhlIHZhbHVlIGZyb20gdGhlIGtleSxwYWlyKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdQYXJ0bmVyT2ZmZXJzOiBPZmZlcltdID0gZmlkZWxpc1BhcnRuZXJzTWFwLmdldChvZmZlciEuYnJhbmREYmEhKSE7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1BhcnRuZXJPZmZlcnMucHVzaChvZmZlciEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzTWFwLnNldChvZmZlciEuYnJhbmREYmEhLCBleGlzdGluZ1BhcnRuZXJPZmZlcnMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQgZG9lcyBub3QsIHRoZW4gY3JlYXRlIGEgbmV3IGtleSx2YWx1ZSBwYWlyIHdpdGggdGhpcyBwYXJ0bmVyIGFuZCB0aGUgb2ZmZXIgb2JzZXJ2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZGVsaXNQYXJ0bmVyc01hcC5zZXQob2ZmZXIhLmJyYW5kRGJhISwgW29mZmVyIV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBidWlsZCB0aGUgbGlzdCBvZiBwYXJ0bmVycyB0byByZXR1cm5cbiAgICAgICAgICAgICAgICBsZXQgZmlkZWxpc1BhcnRuZXJzU29ydGVkTWFwOiBNYXA8bnVtYmVyLFtzdHJpbmcsIE9mZmVyW11dPiA9IG5ldyBNYXA8bnVtYmVyLCBbc3RyaW5nLCBPZmZlcltdXT4oKTtcbiAgICAgICAgICAgICAgICBmaWRlbGlzUGFydG5lcnNNYXAuZm9yRWFjaCgoZmlkZWxpc09mZmVycywgYnJhbmROYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGdpdmUgYSB3ZWlnaHQgdG8gdGhlIGJyYW5kIG5hbWUgZGVwZW5kaW5nIG9uIGhvdyB3ZSB3YW50IHRoZW0gdG8gc2hvdyB1cFxuICAgICAgICAgICAgICAgICAgICBGaWRlbGlzUGFydG5lck9yZGVyLmluY2x1ZGVzKGJyYW5kTmFtZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzU29ydGVkTWFwLnNldChGaWRlbGlzUGFydG5lck9yZGVyLmluZGV4T2YoYnJhbmROYW1lLnRyaW1TdGFydCgpLnRyaW1FbmQoKSksIFticmFuZE5hbWUsIGZpZGVsaXNPZmZlcnNdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBmaWRlbGlzUGFydG5lcnNTb3J0ZWRNYXAgPSBuZXcgTWFwKFsuLi5maWRlbGlzUGFydG5lcnNTb3J0ZWRNYXBdLnNvcnQoKGEsIGIpID0+IGFbMF0gLSBiWzBdKSk7XG5cbiAgICAgICAgICAgICAgICBmaWRlbGlzUGFydG5lcnNTb3J0ZWRNYXAuZm9yRWFjaCgoW2JyYW5kTmFtZSwgZmlkZWxpc09mZmVyc10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmlkZWxpc1BhcnRuZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmROYW1lOiBicmFuZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXRlcmFuT3duZWQ6IEZpZGVsaXNWZXRlcmFuT3duZWRQYXJ0bmVycy5pbmNsdWRlcyhicmFuZE5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyT2ZPZmZlcnM6IGZpZGVsaXNPZmZlcnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXJzOiBmaWRlbGlzT2ZmZXJzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIEZpZGVsaXMgcGFydG5lcnMgYWxvbmdzaWRlIHRoZWlyIG9mZmVyc1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGZpZGVsaXNQYXJ0bmVyc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBmaXJzdCBnZXQgb2ZmZXJzIGNhbGwgJHtKU09OLnN0cmluZ2lmeShmaXJzdE9mZmVyc1Jlc3BvbnNlKX0hYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=