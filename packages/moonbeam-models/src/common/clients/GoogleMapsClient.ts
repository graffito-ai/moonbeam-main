import {BaseAPIClient} from "./BaseAPIClient";
import {GeocodeAsyncResponse, UtilitiesErrorType} from "../GraphqlExports";
import {Constants} from "../Constants";
import axios from "axios";

/**
 * Class used as the base/generic client for all Google Maps APIs calls.
 */
export class GoogleMapsClient extends BaseAPIClient {

    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string) {
        super(region, environment);
    }

    /**
     * Function used to geocode a particular address, for a location to be passed in.
     *
     * @param address which we will retrieve the geocoded information for.
     *
     * @returns a {@link GeocodeAsyncResponse}, representing the passed in address's
     * geocoded information.
     */
    async geoCodeAsync(address: string): Promise<GeocodeAsyncResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'geoCodeAsync Google Maps APIs';

        try {
            // retrieve the API Key and Base URL, needed in order to GeoCode the passed in address accordingly
            const [googleMapsAPIsBaseUrl, googleMapsAPIsPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.GOOGLE_MAPS_APIS_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (googleMapsAPIsBaseUrl === null || googleMapsAPIsBaseUrl.length === 0 ||
                googleMapsAPIsPrivateKey === null || googleMapsAPIsPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Google Maps APIs calls!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: UtilitiesErrorType.UnexpectedError
                };
            }

            /**
             * GET /maps/api/place/autocomplete/json?input={address}&types=geocode&key={googleMapsAPIsPrivateKey}
             * @link https://developers.google.com/maps/documentation/places/web-service/autocomplete
             *
             * build the Google Maps API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.get(`${googleMapsAPIsBaseUrl}/maps/api/place/autocomplete/json?input=${address}&types=geocode&key=${googleMapsAPIsPrivateKey}`, {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Google Maps API timed out after 15000ms!'
            }).then(googleMapsAutoCompletedResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(googleMapsAutoCompletedResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (googleMapsAutoCompletedResponse.data !== undefined && googleMapsAutoCompletedResponse.data["predictions"] !== undefined &&
                    googleMapsAutoCompletedResponse.data["predictions"] !== null && googleMapsAutoCompletedResponse.data["predictions"].length !== 0 &&
                    googleMapsAutoCompletedResponse.data["predictions"][0]["place_id"] !== undefined && googleMapsAutoCompletedResponse.data["predictions"][0]["place_id"] !== null &&
                    googleMapsAutoCompletedResponse.data["predictions"][0]["place_id"].length !== 0) {
                    // retrieve the Google Places Autocomplete Place ID retrieved through the API
                    const placeID = googleMapsAutoCompletedResponse.data["predictions"][0]["place_id"];

                    /**
                     *
                     *
                     * GET /maps/api/geocode/json?place_id={placeID}}&key={googleMapsAPIsPrivateKey}
                     * @link https://developers.google.com/maps/documentation/geocoding/
                     *
                     * build the Google Maps API request body to be passed in, and perform a GET to it with the appropriate information
                     * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
                     * error for a better customer experience.
                     */
                    return axios.get(`${googleMapsAPIsBaseUrl}/maps/api/geocode/json?place_id=${placeID}&key=${googleMapsAPIsPrivateKey}`, {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        timeout: 15000, // in milliseconds here
                        timeoutErrorMessage: 'Google Maps API timed out after 15000ms!'
                    }).then(googleMapsGeoCodeResponse => {
                        console.log(`${endpointInfo} response ${JSON.stringify(googleMapsGeoCodeResponse.data)}`);

                        /**
                         * if we reached this, then we assume that a 2xx response code was returned.
                         * check the contents of the response, and act appropriately.
                         */
                        if (googleMapsGeoCodeResponse.data !== undefined && googleMapsGeoCodeResponse.data["results"] !== undefined &&
                            googleMapsGeoCodeResponse.data["results"] !== null && googleMapsGeoCodeResponse.data["results"].length !== 0 &&
                            googleMapsGeoCodeResponse.data["results"][0]["geometry"] !== undefined && googleMapsGeoCodeResponse.data["results"][0]["geometry"] !== null &&
                            googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"] !== undefined && googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"] !== null &&
                            googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"]["lat"] !== undefined && googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"]["lat"] !== null &&
                            googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"]["lat"].length !== 0 &&
                            googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"]["lng"] !== undefined && googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"]["lng"] !== null &&
                            googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"]["lng"].length !== 0) {
                            // return the retrieved the latitude and longitude
                            return {
                                data: [
                                    {
                                        latitude: googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"]["lat"],
                                        longitude: googleMapsGeoCodeResponse.data["results"][0]["geometry"]["location"]["lng"]
                                    }
                                ]
                            };
                        } else {
                            return {
                                errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                                errorType: UtilitiesErrorType.ValidationError
                            }
                        }
                    }).catch(error => {
                        if (error.response) {
                            /**
                             * The request was made and the server responded with a status code
                             * that falls out of the range of 2xx.
                             */
                            const errorMessage = `Non 2xxx response while calling the ${endpointInfo} GeoCode API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                            console.log(errorMessage);

                            // any other specific errors to be filtered below
                            return {
                                errorMessage: errorMessage,
                                errorType: UtilitiesErrorType.UnexpectedError
                            };
                        } else if (error.request) {
                            /**
                             * The request was made but no response was received
                             * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                             *  http.ClientRequest in node.js.
                             */
                            const errorMessage = `No response received while calling the ${endpointInfo} GeoCode API, for request ${error.request}`;
                            console.log(errorMessage);

                            return {
                                errorMessage: errorMessage,
                                errorType: UtilitiesErrorType.UnexpectedError
                            };
                        } else {
                            // Something happened in setting up the request that triggered an Error
                            const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} GeoCode API, ${(error && error.message) && error.message}`;
                            console.log(errorMessage);

                            return {
                                errorMessage: errorMessage,
                                errorType: UtilitiesErrorType.UnexpectedError
                            };
                        }
                    });
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: UtilitiesErrorType.ValidationError
                    }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Places API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: UtilitiesErrorType.UnexpectedError
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Places API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: UtilitiesErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Places API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: UtilitiesErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while GeoCoding ${address} through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: UtilitiesErrorType.UnexpectedError
            };
        }
    }
}
