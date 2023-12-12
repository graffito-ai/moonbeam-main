import {
    GetOffersInput,
    Offer,
    OfferFilter,
    OffersErrorType,
    OffersResponse,
    OliveClient, PremierClickOnlineOfferOrder,
    PremierOnlineOfferOrder,
    RedemptionType
} from "@moonbeam/moonbeam-models";

/**
 * GetPremierOffers resolver - used mainly for returning premier nearby,
 * as well as premier online offers
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
export const getPremierOffers = async (fieldName: string, getOffersInput: GetOffersInput): Promise<OffersResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // check if a valid filter is passed in
        if (getOffersInput.filterType !== OfferFilter.PremierNearby && getOffersInput.filterType !== OfferFilter.PremierOnline) {
            const errorMessage = `Unsupported filter for premier offers query filter ${getOffersInput.filterType}. Use getFidelisPartners, getOffers or getSeasonalOffers instead.`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: OffersErrorType.ValidationError
            }
        } else {
            // check if valid information is passed in
            if (getOffersInput.filterType === OfferFilter.PremierNearby
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

                    // filter the online offers according to how we want them displayed
                    if (getOffersInput.filterType === OfferFilter.PremierOnline) {
                        // sort the regular online and/or the click-based online offers how we want them displayed
                        const premierOnlineOffersOrder: string[] = getOffersInput.redemptionType === RedemptionType.Click
                            ? PremierClickOnlineOfferOrder : PremierOnlineOfferOrder;
                        let premierOnlineSortedMap: Map<number, Offer> = new Map<number, Offer>();
                        offersResponse.data.offers.forEach(offer => {
                            // give a weight to the brand DBA depending on how we want them to show up
                            offer !== undefined && offer !== null && offer!.brandDba !== undefined &&
                            offer!.brandDba !== null && premierOnlineOffersOrder.includes(offer!.brandDba!.trimStart().trimEnd()) &&
                            premierOnlineSortedMap.set(premierOnlineOffersOrder.indexOf(offer!.brandDba!.trimStart().trimEnd()), offer);
                        });
                        premierOnlineSortedMap = new Map([...premierOnlineSortedMap].sort((a, b) => a[0] - b[0]));

                        // set the response's offers, to the sorted offers
                        const sortedOffers: Offer[] = [];
                        premierOnlineSortedMap.forEach((offer, _) => {
                            sortedOffers.push(offer);
                        });
                        offersResponse.data.offers = sortedOffers;

                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        }
                    } else {
                        // returns the response data with the appropriate offers information
                        return {
                            data: offersResponse.data
                        }
                    }
                } else {
                    const errorMessage = `Unexpected response structure returned from the get premier offers call ${JSON.stringify(offersResponse)}!`;
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
