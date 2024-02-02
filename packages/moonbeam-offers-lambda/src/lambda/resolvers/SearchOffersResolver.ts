import {OffersErrorType, OffersResponse, OliveClient, RewardType, SearchOffersInput} from "@moonbeam/moonbeam-models";

/**
 * SearchOffers resolver - used for searching offers, based
 * on a specific input
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param searchOffersInput offers input used for the offers objects to be searched
 * and returned
 *
 * @returns {@link Promise} of {@link OffersResponse}
 */
export const searchOffers = async (fieldName: string, searchOffersInput: SearchOffersInput): Promise<OffersResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // check if a valid filter is passed in
        if (
            (searchOffersInput.radiusLongitude !== undefined && searchOffersInput.radiusLongitude !== null &&
                (searchOffersInput.radius === undefined || searchOffersInput.radiusLatitude === undefined)
            ) ||
            (searchOffersInput.radiusLatitude !== undefined && searchOffersInput.radiusLatitude !== null &&
                (searchOffersInput.radius === undefined || searchOffersInput.radiusLongitude === undefined)
            ) ||
            (searchOffersInput.radius !== undefined && searchOffersInput.radius !== null &&
                (searchOffersInput.radiusLatitude === undefined || searchOffersInput.radiusLongitude === undefined)
            )
        ) {
            const errorMessage = `Invalid radiusLongitude, radiusLatitude and radius input combination. Be sure to pass all three.`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: OffersErrorType.ValidationError
            }
        } else {
            // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
            const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

            // execute the GET offers Olive REST call
            const searchOffersResponse: OffersResponse = await oliveClient.searchOffers(searchOffersInput);

            // check to see if the offers call was executed successfully
            if (searchOffersResponse && !searchOffersResponse.errorMessage && !searchOffersResponse.errorType && searchOffersResponse.data &&
                searchOffersResponse.data.totalNumberOfPages !== undefined && searchOffersResponse.data.totalNumberOfRecords !== undefined &&
                searchOffersResponse.data.offers !== undefined) {

                /**
                 * Todo: Remove this once the front-end is changed. Olive changed the type of the reward type for their enum so we're going to patch
                 * this so we match with whatever we had this on the front-end before they made this breaking change.
                 */
                searchOffersResponse.data.offers.forEach(retrievedOffer => {
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
                    data: searchOffersResponse.data
                }
            } else {
                const errorMessage = `Unexpected response structure returned from the search offers call ${JSON.stringify(searchOffersResponse)}!`;
                console.log(errorMessage);

                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return {
                    errorType: OffersErrorType.ValidationError,
                    errorMessage: errorMessage
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
