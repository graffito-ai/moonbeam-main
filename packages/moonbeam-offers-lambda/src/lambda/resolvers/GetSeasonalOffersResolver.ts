import {
    GetOffersInput,
    OfferFilter,
    OffersErrorType,
    OffersResponse,
    OliveClient,
    RewardType
} from "@moonbeam/moonbeam-models";

/**
 * GetSeasonalOffers resolver - used mainly for returning seasonal nearby,
 * as well as seasonal online offers.
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
export const getSeasonalOffers = async (fieldName: string, getOffersInput: GetOffersInput): Promise<OffersResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // check if a valid filter is passed in
        if (getOffersInput.filterType !== OfferFilter.SeasonalNearby && getOffersInput.filterType !== OfferFilter.SeasonalOnline) {
            const errorMessage = `Unsupported filter for seasonal offers query filter ${getOffersInput.filterType}. Use getFidelisPartners, getOffers or getPremierOffers instead.`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: OffersErrorType.ValidationError
            }
        } else {
            // check if valid information is passed in
            if (getOffersInput.filterType === OfferFilter.SeasonalNearby
                && (!getOffersInput.radius || !getOffersInput.radiusLatitude || !getOffersInput.radiusLongitude || getOffersInput.radiusIncludeOnlineStores === undefined)) {
                const errorMessage = `Invalid information passed in for offers query filter ${getOffersInput.filterType}.`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: OffersErrorType.ValidationError
                }
            } else {
                if (getOffersInput.offerSeasonalType === null || getOffersInput.offerSeasonalType === undefined) {
                    const errorMessage = `No offer seasonal type passed in for filter ${getOffersInput.filterType}.`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: OffersErrorType.ValidationError
                    }
                } else {
                    // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
                    const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

                    // execute the GET offers Olive REST call
                    const offersResponse: OffersResponse = await oliveClient.getOffers(getOffersInput, 3);

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
                                retrievedOffer.reward!.type !== undefined && retrievedOffer.reward!.type !== null) {
                                /**
                                 * switch Fixed to RewardAmount and
                                 * switch Percentage to RewardPercentage
                                 */
                                if (retrievedOffer.reward!.type! === RewardType.Percentage) {
                                    retrievedOffer.reward!.type! = RewardType.RewardPercent;
                                }
                                if (retrievedOffer.reward!.type! === RewardType.Fixed) {
                                    retrievedOffer.reward!.type! = RewardType.RewardAmount;
                                }
                            }
                        });

                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        }
                    } else {
                        const errorMessage = `Unexpected response structure returned from the get seasonal offers call ${JSON.stringify(offersResponse)}!`;
                        console.log(errorMessage);

                        // if there are errors associated with the call, just return the error message and error type from the upstream client
                        return {
                            errorType: OffersErrorType.ValidationError,
                            errorMessage: errorMessage
                        }
                    }
                }
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);

        return {
            errorMessage: errorMessage,
            errorType: OffersErrorType.UnexpectedError
        };
    }
}
