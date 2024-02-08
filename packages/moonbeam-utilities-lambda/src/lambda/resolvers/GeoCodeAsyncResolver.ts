import {GeocodeAsyncResponse, UtilitiesErrorType, GoogleMapsClient, GeocodeAsyncInput} from "@moonbeam/moonbeam-models";

/**
 * GeoCodeAsync resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param geocodeAsyncInput input used to contain the details for address and platform
 * that we are performing the geocoding for.
 *
 * @returns {@link Promise} of {@link GeocodeAsyncResponse}
 */
export const geoCodeAsync = async (fieldName: string, geocodeAsyncInput: GeocodeAsyncInput): Promise<GeocodeAsyncResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initialize a new Google Maps APIs client, in order to retrieve the Google Maps APIs credentials
        const googleMapsApiClient = new GoogleMapsClient(process.env.ENV_NAME!, region);

        // return the GeoCoded address accordingly
        return googleMapsApiClient.geoCodeAsync(geocodeAsyncInput);
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: UtilitiesErrorType.UnexpectedError
        };
    }
}
