import {
    GetOffersInput,
    Offer,
    OfferFilter,
    OffersErrorType,
    OffersResponse,
    OliveClient,
    PremierOnlineDevOfferIds,
    PremierOnlineProdOfferIds,
    Stages
} from "@moonbeam/moonbeam-models";

/**
 * GetOffers resolver - used mainly for returning nearby as well as online offers
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
export const getOffers = async (fieldName: string, getOffersInput: GetOffersInput): Promise<OffersResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // check if a valid filter is passed in
        if (getOffersInput.filterType !== OfferFilter.Nearby && getOffersInput.filterType !== OfferFilter.Online &&
            getOffersInput.filterType !== OfferFilter.CategorizedOnline && getOffersInput.filterType !== OfferFilter.CategorizedNearby) {
            const errorMessage = `Unsupported filter for offers query filter ${getOffersInput.filterType}. Use getFidelisPartners, getPremierOffers or getSeasonalOffers instead.`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: OffersErrorType.ValidationError
            }
        } else {
            // check if valid information is passed in
            if ((getOffersInput.filterType === OfferFilter.Nearby || getOffersInput.filterType === OfferFilter.CategorizedNearby)
                && (!getOffersInput.radius || !getOffersInput.radiusLatitude || !getOffersInput.radiusLongitude || getOffersInput.radiusIncludeOnlineStores === undefined)) {
                const errorMessage = `Invalid information passed in for offers query filter ${getOffersInput.filterType}.`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: OffersErrorType.ValidationError
                }
            } else {
                // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
                const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

                // execute the GET offers Olive REST call
                const offersResponse: OffersResponse = await oliveClient.getOffers(getOffersInput);

                // check to see if the offers call was executed successfully
                if (offersResponse && !offersResponse.errorMessage && !offersResponse.errorType && offersResponse.data &&
                    offersResponse.data.totalNumberOfPages !== undefined && offersResponse.data.totalNumberOfRecords !== undefined &&
                    offersResponse.data.offers !== undefined) {
                    /**
                     * we need to filter out the Premier Online and Premier Nearby offers since they will be displayed
                     * as part of the getPremierOffersResolver query
                     */
                    let allOffers: Offer[] = [];

                    if (getOffersInput.filterType === OfferFilter.Nearby || getOffersInput.filterType === OfferFilter.CategorizedNearby ||
                        getOffersInput.filterType === OfferFilter.CategorizedOnline) {
                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        }
                    }
                    if (getOffersInput.filterType === OfferFilter.Online) {
                        offersResponse.data.offers.forEach(offer => {
                            if (process.env.ENV_NAME! === Stages.DEV && !PremierOnlineDevOfferIds.includes(offer!.id!)) {
                                allOffers.push(offer!);
                            }
                            if (process.env.ENV_NAME! === Stages.PROD && !PremierOnlineProdOfferIds.includes(offer!.id!)) {
                                allOffers.push(offer!);
                            }
                        });

                        offersResponse.data.offers = allOffers;

                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        }
                    }

                    // returns the response data with the appropriate offers information
                    return {
                        data: offersResponse.data
                    }
                } else {
                    const errorMessage = `Unexpected response structure returned from the get offers call ${JSON.stringify(offersResponse)}!`;
                    console.log(errorMessage);

                    // if there are errors associated with the call, just return the error message and error type from the upstream client
                    return {
                        errorType: OffersErrorType.ValidationError,
                        errorMessage: errorMessage
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
