import {
    GetLocationPredictionsInput,
    GetLocationPredictionsResponse,
    GoogleMapsClient,
    UtilitiesErrorType
} from "@moonbeam/moonbeam-models";

/**
 * GetLocationPredictions resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getLocationPredictionsInput input used to retrieve location predictions
 * for a particular address.
 *
 * @returns {@link Promise} of {@link GetLocationPredictionsResponse}
 */
export const getLocationPredictions = async (fieldName: string, getLocationPredictionsInput: GetLocationPredictionsInput): Promise<GetLocationPredictionsResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initialize a new Google Maps APIs client, in order to retrieve the Google Maps APIs credentials
        const googleMapsApiClient = new GoogleMapsClient(process.env.ENV_NAME!, region);

        // return the retrieved Location Predictions
        return googleMapsApiClient.getLocationPredictions(getLocationPredictionsInput);
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: UtilitiesErrorType.UnexpectedError
        };
    }
}
