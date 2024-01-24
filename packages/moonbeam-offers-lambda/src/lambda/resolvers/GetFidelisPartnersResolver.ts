import {
    FidelisPartner,
    FidelisPartnerResponse,
    Maybe,
    Offer,
    OffersErrorType,
    OffersResponse,
    OliveClient,
    RedemptionType,
    CountryCode, OfferAvailability, OfferFilter, OfferState, FidelisPartnerOrder,
    FidelisVeteranOwnedPartners, RewardType
} from "@moonbeam/moonbeam-models";

/**
 * GetFidelisPartners resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link OffersResponse}
 */
export const getFidelisPartners = async (fieldName: string): Promise<FidelisPartnerResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
        const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

        // we start with page 1
        let pageNumber = 1;

        // constant used to keep track of the Fidelis offers retrieved
        let fidelisOffers: Maybe<Offer>[] = [];

        // execute the first GET offers Olive REST call
        const firstOffersResponse: OffersResponse = await oliveClient.getOffers({
            availability: OfferAvailability.ClientOnly,
            countryCode: CountryCode.Us,
            redemptionType: RedemptionType.Cardlinked, // only interested in card linked offers
            filterType: OfferFilter.Fidelis,
            offerStates: [OfferState.Active, OfferState.Scheduled], // we want to retrieve active (regular discount) and scheduled (birthday, holiday) offers
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

            // set the Fidelis offers accordingly
            fidelisOffers.push(...firstOffersResponse.data.offers);

            // execute as many calls as the number of remaining pages (in order to get all Fidelis offers)
            let remainingPages = firstOffersResponse.data.totalNumberOfPages - pageNumber;
            while (remainingPages > 0) {
                // increase pageNumber
                pageNumber += 1;

                // execute the subsequent GET offers Olive REST call
                const subsequentOffersResponse: OffersResponse = await oliveClient.getOffers({
                    availability: OfferAvailability.ClientOnly,
                    countryCode: CountryCode.Us,
                    redemptionType: RedemptionType.Cardlinked, // only interested in card linked offers
                    filterType: OfferFilter.Fidelis,
                    offerStates: [OfferState.Active, OfferState.Scheduled], // we want to retrieve active (regular discount) and scheduled (birthday, holiday) offers
                    pageNumber: pageNumber,
                    pageSize: 50 // display 50 offers at a time (that we will then use to aggregate throughout our Fidelis partners)
                }, 3);

                // check to see if the subsequent offers call was executed successfully
                if (subsequentOffersResponse && !subsequentOffersResponse.errorMessage && !subsequentOffersResponse.errorType && subsequentOffersResponse.data &&
                    subsequentOffersResponse.data.totalNumberOfPages !== undefined && subsequentOffersResponse.data.totalNumberOfRecords !== undefined &&
                    subsequentOffersResponse.data.offers !== undefined) {
                    // set the Fidelis offers accordingly
                    fidelisOffers.push(...subsequentOffersResponse.data.offers);
                } else {
                    const errorMessage = `Unexpected response structure returned from a subsequent get offers call ${JSON.stringify(subsequentOffersResponse)} for page ${pageNumber}!`;
                    console.log(errorMessage);

                    // if there are errors associated with the call, just return the error message and error type from the upstream client
                    return {
                        errorType: OffersErrorType.ValidationError,
                        errorMessage: errorMessage
                    }
                }
            }

            // check if there are no matched Fidelis offers returned
            if (fidelisOffers!.length === 0) {
                const errorMessage = `No Fidelis offers to display for partners!`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: OffersErrorType.NoneOrAbsent
                }
            } else {
                // go through the retrieved Fidelis offers from all record pages, and build the Fidelis partners accordingly
                const fidelisPartnersMap: Map<string, Offer[]> = new Map<string, Offer[]>();
                const fidelisPartners: FidelisPartner[] = [];
                fidelisOffers!.forEach(offer => {
                    // check to see if the offer's Fidelis partner, already exists in the map above
                    if (fidelisPartnersMap.has(offer!.brandDba!)) {
                        // if it already does exist, then add the offer in the element's list of offers (as the value from the key,pair)
                        const existingPartnerOffers: Offer[] = fidelisPartnersMap.get(offer!.brandDba!)!;
                        existingPartnerOffers.push(offer!);
                        fidelisPartnersMap.set(offer!.brandDba!, existingPartnerOffers);
                    } else {
                        // if it does not, then create a new key,value pair with this partner and the offer observed
                        fidelisPartnersMap.set(offer!.brandDba!, [offer!]);
                    }
                });

                // build the list of partners to return
                let fidelisPartnersSortedMap: Map<number,[string, Offer[]]> = new Map<number, [string, Offer[]]>();
                fidelisPartnersMap.forEach((fidelisOffers, brandName) => {
                    // give a weight to the brand name depending on how we want them to show up
                    FidelisPartnerOrder.includes(brandName) &&
                    fidelisPartnersSortedMap.set(FidelisPartnerOrder.indexOf(brandName.trimStart().trimEnd()), [brandName, fidelisOffers]);
                });
                fidelisPartnersSortedMap = new Map([...fidelisPartnersSortedMap].sort((a, b) => a[0] - b[0]));

                fidelisPartnersSortedMap.forEach(([brandName, fidelisOffers]) => {
                    fidelisPartners.push({
                        brandName: brandName,
                        veteranOwned: FidelisVeteranOwnedPartners.includes(brandName),
                        numberOfOffers: fidelisOffers.length,
                        offers: fidelisOffers
                    });
                });

                // return the list of Fidelis partners alongside their offers
                return {
                    data: fidelisPartners
                }
            }
        } else {
            const errorMessage = `Unexpected response structure returned from the first get offers call ${JSON.stringify(firstOffersResponse)}!`;
            console.log(errorMessage);

            // if there are errors associated with the call, just return the error message and error type from the upstream client
            return {
                errorType: OffersErrorType.ValidationError,
                errorMessage: errorMessage
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
