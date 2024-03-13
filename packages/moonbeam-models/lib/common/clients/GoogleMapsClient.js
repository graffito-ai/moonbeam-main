"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMapsClient = void 0;
const BaseAPIClient_1 = require("./BaseAPIClient");
const GraphqlExports_1 = require("../GraphqlExports");
const Constants_1 = require("../Constants");
const axios_1 = __importDefault(require("axios"));
/**
 * Class used as the base/generic client for all Google Maps APIs calls.
 */
class GoogleMapsClient extends BaseAPIClient_1.BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment, region) {
        super(region, environment);
    }
    /**
     * Function used to retrieve location predictions, for a location to be passed in.
     *
     * @param getLocationPredictionsInput input passed in,
     * which we will be used in returning location predictions
     *
     * @returns a {@link GetLocationPredictionsResponse}, representing the retrieved location predictions
     * to be returned.
     *
     * @protected
     */
    async getLocationPredictions(getLocationPredictionsInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'geoCodeAsync for Location Permissions Google Maps APIs';
        try {
            // retrieve the API Key and Base URL, needed in order to GeoCode the passed in address accordingly
            const [googleMapsAPIsBaseUrl, googleMapsAPIsIOSPrivateKey, googleMapsAPIsAndroidPrivateKey, googleMapsAndroidSha, googleMapsBackedAPIsKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.GOOGLE_MAPS_APIS_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (googleMapsAPIsBaseUrl === null || googleMapsAPIsBaseUrl.length === 0 ||
                googleMapsAPIsIOSPrivateKey === null || googleMapsAPIsIOSPrivateKey.length === 0 ||
                googleMapsAPIsAndroidPrivateKey === undefined || googleMapsAPIsAndroidPrivateKey === null ||
                googleMapsAPIsAndroidPrivateKey.length === 0 || googleMapsAndroidSha === undefined ||
                googleMapsAndroidSha === null || googleMapsAndroidSha.length === 0 ||
                googleMapsBackedAPIsKey === undefined || googleMapsBackedAPIsKey === null ||
                googleMapsBackedAPIsKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Google Maps APIs calls!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                };
            }
            // depending on the OSType passed in, build headers as well as keys accordingly
            let googleMapsAPIsPrivateKey = "";
            let headers = {};
            if (getLocationPredictionsInput.osType === GraphqlExports_1.OsType.Ios) {
                googleMapsAPIsPrivateKey = googleMapsAPIsIOSPrivateKey;
                headers = {
                    "Content-Type": "application/json",
                    "x-ios-bundle-identifier": "com.moonbeam.moonbeamfinance"
                };
            }
            else {
                googleMapsAPIsPrivateKey = googleMapsAPIsAndroidPrivateKey;
                headers = {
                    "Content-Type": "application/json",
                    "x-android-cert": `${googleMapsAndroidSha}`,
                    "x-android-package": "com.moonbeam.moonbeamfin"
                };
            }
            /**
             * GET /maps/api/place/autocomplete/json?input={address}&key={googleMapsAPIsPrivateKey}&types=address&components=country:us&language=en
             * @link https://developers.google.com/maps/documentation/places/web-service/autocomplete
             *
             * build the Google Maps API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${googleMapsAPIsBaseUrl}/maps/api/place/autocomplete/json?key=${googleMapsAPIsPrivateKey}&input=${encodeURIComponent(getLocationPredictionsInput.address)}&types=address&components=country:us&language=en`, {
                headers: headers,
                timeout: 15000,
                timeoutErrorMessage: 'Google Maps API timed out after 15000ms!'
            }).then(async (googleMapsAutoCompletedResponse) => {
                console.log(`${endpointInfo} response ${JSON.stringify(googleMapsAutoCompletedResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (googleMapsAutoCompletedResponse.data !== undefined && googleMapsAutoCompletedResponse.data["predictions"] !== undefined &&
                    googleMapsAutoCompletedResponse.data["predictions"] !== null && googleMapsAutoCompletedResponse.data["predictions"].length !== 0) {
                    // results to be returned
                    const results = [];
                    // for each one of the predictions get the address components
                    for (const prediction of googleMapsAutoCompletedResponse.data["predictions"]) {
                        if (prediction["place_id"]) {
                            const placeId = prediction["place_id"];
                            /**
                             * GET /maps/api/geocode/json?place_id={placeID}}&key={googleMapsAPIsPrivateKey}
                             * @link https://developers.google.com/maps/documentation/geocoding/
                             *
                             * build the Google Maps API request body to be passed in, and perform a GET to it with the appropriate information
                             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
                             * error for a better customer experience.
                             */
                            const googleMapsGeoCodeResponse = await axios_1.default.get(`${googleMapsAPIsBaseUrl}/maps/api/geocode/json?place_id=${placeId}&key=${googleMapsAPIsPrivateKey}`, {
                                headers: headers,
                                timeout: 15000,
                                timeoutErrorMessage: 'Google Maps API timed out after 15000ms!'
                            });
                            /**
                             * if we reached this, then we assume that a 2xx response code was returned.
                             * check the contents of the response, and act appropriately.
                             */
                            if (googleMapsGeoCodeResponse.data !== undefined && googleMapsGeoCodeResponse.data["results"] !== undefined &&
                                googleMapsGeoCodeResponse.data["results"] !== null && googleMapsGeoCodeResponse.data["results"].length !== 0 &&
                                googleMapsGeoCodeResponse.data["results"][0]["address_components"] !== undefined && googleMapsGeoCodeResponse.data["results"][0]["address_components"] !== null &&
                                googleMapsGeoCodeResponse.data["results"][0]["address_components"].length !== 0) {
                                // add the appropriate result with its address_components in the list of results
                                const newPrediction = {
                                    address_components: JSON.stringify(googleMapsGeoCodeResponse.data["results"][0]["address_components"]),
                                    description: prediction["description"],
                                    matched_substrings: JSON.stringify(prediction["matched_substrings"]),
                                    place_id: prediction["place_id"],
                                    reference: prediction["reference"],
                                    structured_formatting: JSON.stringify(prediction["structured_formatting"]),
                                    terms: JSON.stringify(prediction["terms"]),
                                    types: prediction["types"]
                                };
                                results.push(newPrediction);
                            }
                            else {
                                const errorMessage = `Invalid response structure returned from Latter ${endpointInfo} Places API response!`;
                                console.log(errorMessage);
                            }
                        }
                    }
                    return {
                        data: results
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from Latter ${endpointInfo} Places API response!`,
                        errorType: GraphqlExports_1.UtilitiesErrorType.ValidationError
                    };
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
                        errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Places API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Places API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving Location Predictions ${getLocationPredictionsInput.address} through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to geocode a particular address, for a location to be passed in.
     *
     * @param geocodeAsyncInput input passed in,
     * which we will retrieve the geocoded information for.
     *
     * @returns a {@link GeocodeAsyncResponse}, representing the passed in address's
     * geocoded information.
     *
     * @protected
     */
    async geoCodeAsync(geocodeAsyncInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'geoCodeAsync Google Maps APIs';
        try {
            // retrieve the API Key and Base URL, needed in order to GeoCode the passed in address accordingly
            const [googleMapsAPIsBaseUrl, googleMapsAPIsIOSPrivateKey, googleMapsAPIsAndroidPrivateKey, googleMapsAndroidSha, googleMapsBackedAPIsKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.GOOGLE_MAPS_APIS_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (googleMapsAPIsBaseUrl === null || googleMapsAPIsBaseUrl.length === 0 ||
                googleMapsAPIsIOSPrivateKey === null || googleMapsAPIsIOSPrivateKey.length === 0 ||
                googleMapsAPIsAndroidPrivateKey === undefined || googleMapsAPIsAndroidPrivateKey === null ||
                googleMapsAPIsAndroidPrivateKey.length === 0 || googleMapsAndroidSha === undefined ||
                googleMapsAndroidSha === null || googleMapsAndroidSha.length === 0 ||
                googleMapsBackedAPIsKey === undefined || googleMapsBackedAPIsKey === null ||
                googleMapsBackedAPIsKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Google Maps APIs calls!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                };
            }
            // depending on the OSType passed in, build headers as well as keys accordingly
            let googleMapsAPIsPrivateKey = "";
            let headers = {};
            if (geocodeAsyncInput.osType === GraphqlExports_1.OsType.Ios) {
                googleMapsAPIsPrivateKey = googleMapsAPIsIOSPrivateKey;
                headers = {
                    "Content-Type": "application/json",
                    "x-ios-bundle-identifier": "com.moonbeam.moonbeamfinance"
                };
            }
            else {
                googleMapsAPIsPrivateKey = googleMapsAPIsAndroidPrivateKey;
                headers = {
                    "Content-Type": "application/json",
                    "x-android-cert": `${googleMapsAndroidSha}`,
                    "x-android-package": "com.moonbeam.moonbeamfin"
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
            return axios_1.default.get(`${googleMapsAPIsBaseUrl}/maps/api/place/autocomplete/json?input=${encodeURIComponent(geocodeAsyncInput.address)}&types=geocode&key=${googleMapsAPIsPrivateKey}`, {
                headers: headers,
                timeout: 15000,
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
                     * GET /maps/api/geocode/json?place_id={placeID}}&key={googleMapsAPIsPrivateKey}
                     * @link https://developers.google.com/maps/documentation/geocoding/
                     *
                     * build the Google Maps API request body to be passed in, and perform a GET to it with the appropriate information
                     * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
                     * error for a better customer experience.
                     */
                    return axios_1.default.get(`${googleMapsAPIsBaseUrl}/maps/api/geocode/json?place_id=${placeID}&key=${googleMapsAPIsPrivateKey}`, {
                        headers: headers,
                        timeout: 15000,
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
                        }
                        else {
                            return {
                                errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                                errorType: GraphqlExports_1.UtilitiesErrorType.ValidationError
                            };
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
                                errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                            };
                        }
                        else if (error.request) {
                            /**
                             * The request was made but no response was received
                             * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                             *  http.ClientRequest in node.js.
                             */
                            const errorMessage = `No response received while calling the ${endpointInfo} GeoCode API, for request ${error.request}`;
                            console.log(errorMessage);
                            return {
                                errorMessage: errorMessage,
                                errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                            };
                        }
                        else {
                            // Something happened in setting up the request that triggered an Error
                            const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} GeoCode API, ${(error && error.message) && error.message}`;
                            console.log(errorMessage);
                            return {
                                errorMessage: errorMessage,
                                errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                            };
                        }
                    });
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.UtilitiesErrorType.ValidationError
                    };
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
                        errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Places API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Places API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while GeoCoding ${geocodeAsyncInput.address} through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
            };
        }
    }
}
exports.GoogleMapsClient = GoogleMapsClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29vZ2xlTWFwc0NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9Hb29nbGVNYXBzQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFRMkI7QUFDM0IsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEsNkJBQWE7SUFFL0M7Ozs7O09BS0c7SUFDSCxZQUFZLFdBQW1CLEVBQUUsTUFBYztRQUMzQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0gsS0FBSyxDQUFDLHNCQUFzQixDQUFDLDJCQUF3RDtRQUNqRiwrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsd0RBQXdELENBQUM7UUFFOUUsSUFBSTtZQUNBLGtHQUFrRztZQUNsRyxNQUFNLENBQUMscUJBQXFCLEVBQUUsMkJBQTJCLEVBQ3JELCtCQUErQixFQUFFLG9CQUFvQixFQUNyRCx1QkFBdUIsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUV4SSw0RUFBNEU7WUFDNUUsSUFBSSxxQkFBcUIsS0FBSyxJQUFJLElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3BFLDJCQUEyQixLQUFLLElBQUksSUFBSSwyQkFBMkIsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDaEYsK0JBQStCLEtBQUssU0FBUyxJQUFJLCtCQUErQixLQUFLLElBQUk7Z0JBQ3pGLCtCQUErQixDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksb0JBQW9CLEtBQUssU0FBUztnQkFDbEYsb0JBQW9CLEtBQUssSUFBSSxJQUFJLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUNsRSx1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T0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksYUFBYSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFMUY7OzsyQkFHRzt3QkFDSCxJQUFJLHlCQUF5QixDQUFDLElBQUksS0FBSyxTQUFTLElBQUkseUJBQXlCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFNBQVM7NEJBQ3ZHLHlCQUF5QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLElBQUkseUJBQXlCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDOzRCQUM1Ryx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssU0FBUyxJQUFJLHlCQUF5QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJOzRCQUMzSSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssU0FBUyxJQUFJLHlCQUF5QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJOzRCQUNuSyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssU0FBUyxJQUFJLHlCQUF5QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJOzRCQUNqTCx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMs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TixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsaUJBQWlCLENBQUMsT0FBTyxZQUFZLFlBQVksRUFBRSxDQUFDO1lBQzdHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztZQUV0QyxPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWtCLENBQUMsZUFBZTthQUNoRCxDQUFDO1NBQ0w7SUFDTCxDQUFDO0NBQ0o7QUE1WkQsNENBNFpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlQVBJQ2xpZW50fSBmcm9tIFwiLi9CYXNlQVBJQ2xpZW50XCI7XG5pbXBvcnQge1xuICAgIEdlb2NvZGVBc3luY0lucHV0LFxuICAgIEdlb2NvZGVBc3luY1Jlc3BvbnNlLFxuICAgIEdldExvY2F0aW9uUHJlZGljdGlvbnNJbnB1dCxcbiAgICBHZXRMb2NhdGlvblByZWRpY3Rpb25zUmVzcG9uc2UsXG4gICAgTG9jYXRpb25QcmVkaWN0aW9uVHlwZSxcbiAgICBPc1R5cGUsXG4gICAgVXRpbGl0aWVzRXJyb3JUeXBlXG59IGZyb20gXCIuLi9HcmFwaHFsRXhwb3J0c1wiO1xuaW1wb3J0IHtDb25zdGFudHN9IGZyb20gXCIuLi9Db25zdGFudHNcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgR29vZ2xlIE1hcHMgQVBJcyBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdvb2dsZU1hcHNDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIGxvY2F0aW9uIHByZWRpY3Rpb25zLCBmb3IgYSBsb2NhdGlvbiB0byBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2V0TG9jYXRpb25QcmVkaWN0aW9uc0lucHV0IGlucHV0IHBhc3NlZCBpbixcbiAgICAgKiB3aGljaCB3ZSB3aWxsIGJlIHVzZWQgaW4gcmV0dXJuaW5nIGxvY2F0aW9uIHByZWRpY3Rpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBHZXRMb2NhdGlvblByZWRpY3Rpb25zUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIHJldHJpZXZlZCBsb2NhdGlvbiBwcmVkaWN0aW9uc1xuICAgICAqIHRvIGJlIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIGdldExvY2F0aW9uUHJlZGljdGlvbnMoZ2V0TG9jYXRpb25QcmVkaWN0aW9uc0lucHV0OiBHZXRMb2NhdGlvblByZWRpY3Rpb25zSW5wdXQpOiBQcm9taXNlPEdldExvY2F0aW9uUHJlZGljdGlvbnNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2VvQ29kZUFzeW5jIGZvciBMb2NhdGlvbiBQZXJtaXNzaW9ucyBHb29nbGUgTWFwcyBBUElzJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gR2VvQ29kZSB0aGUgcGFzc2VkIGluIGFkZHJlc3MgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGNvbnN0IFtnb29nbGVNYXBzQVBJc0Jhc2VVcmwsIGdvb2dsZU1hcHNBUElzSU9TUHJpdmF0ZUtleSxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQVBJc0FuZHJvaWRQcml2YXRlS2V5LCBnb29nbGVNYXBzQW5kcm9pZFNoYSxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQmFja2VkQVBJc0tleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5HT09HTEVfTUFQU19BUElTX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGdvb2dsZU1hcHNBUElzQmFzZVVybCA9PT0gbnVsbCB8fCBnb29nbGVNYXBzQVBJc0Jhc2VVcmwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0FQSXNJT1NQcml2YXRlS2V5ID09PSBudWxsIHx8IGdvb2dsZU1hcHNBUElzSU9TUHJpdmF0ZUtleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQVBJc0FuZHJvaWRQcml2YXRlS2V5ID09PSB1bmRlZmluZWQgfHwgZ29vZ2xlTWFwc0FQSXNBbmRyb2lkUHJpdmF0ZUtleSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBUElzQW5kcm9pZFByaXZhdGVLZXkubGVuZ3RoID09PSAwIHx8IGdvb2dsZU1hcHNBbmRyb2lkU2hhID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQW5kcm9pZFNoYSA9PT0gbnVsbCB8fCBnb29nbGVNYXBzQW5kcm9pZFNoYS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQmFja2VkQVBJc0tleSA9PT0gdW5kZWZpbmVkIHx8IGdvb2dsZU1hcHNCYWNrZWRBUElzS2V5ID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0JhY2tlZEFQSXNLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIEdvb2dsZSBNYXBzIEFQSXMgY2FsbHMhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gdGhlIE9TVHlwZSBwYXNzZWQgaW4sIGJ1aWxkIGhlYWRlcnMgYXMgd2VsbCBhcyBrZXlzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBsZXQgZ29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5OiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnM6IGFueSA9IHt9O1xuICAgICAgICAgICAgaWYgKGdldExvY2F0aW9uUHJlZGljdGlvbnNJbnB1dC5vc1R5cGUgPT09IE9zVHlwZS5Jb3MpIHtcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXkgPSBnb29nbGVNYXBzQVBJc0lPU1ByaXZhdGVLZXk7XG4gICAgICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1pb3MtYnVuZGxlLWlkZW50aWZpZXJcIjogXCJjb20ubW9vbmJlYW0ubW9vbmJlYW1maW5hbmNlXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXkgPSBnb29nbGVNYXBzQVBJc0FuZHJvaWRQcml2YXRlS2V5O1xuICAgICAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYW5kcm9pZC1jZXJ0XCI6IGAke2dvb2dsZU1hcHNBbmRyb2lkU2hhfWAsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hbmRyb2lkLXBhY2thZ2VcIjogXCJjb20ubW9vbmJlYW0ubW9vbmJlYW1maW5cIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9tYXBzL2FwaS9wbGFjZS9hdXRvY29tcGxldGUvanNvbj9pbnB1dD17YWRkcmVzc30ma2V5PXtnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXl9JnR5cGVzPWFkZHJlc3MmY29tcG9uZW50cz1jb3VudHJ5OnVzJmxhbmd1YWdlPWVuXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vcGxhY2VzL3dlYi1zZXJ2aWNlL2F1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBHb29nbGUgTWFwcyBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtnb29nbGVNYXBzQVBJc0Jhc2VVcmx9L21hcHMvYXBpL3BsYWNlL2F1dG9jb21wbGV0ZS9qc29uP2tleT0ke2dvb2dsZU1hcHNBUElzUHJpdmF0ZUtleX0maW5wdXQ9JHtlbmNvZGVVUklDb21wb25lbnQoZ2V0TG9jYXRpb25QcmVkaWN0aW9uc0lucHV0LmFkZHJlc3MpfSZ0eXBlcz1hZGRyZXNzJmNvbXBvbmVudHM9Y291bnRyeTp1cyZsYW5ndWFnZT1lbmAsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdHb29nbGUgTWFwcyBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihhc3luYyBnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl0gIT09IG51bGwgJiYgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl0ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJlc3VsdHMgdG8gYmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0czogTG9jYXRpb25QcmVkaWN0aW9uVHlwZVtdID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGVhY2ggb25lIG9mIHRoZSBwcmVkaWN0aW9ucyBnZXQgdGhlIGFkZHJlc3MgY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByZWRpY3Rpb24gb2YgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmVkaWN0aW9uW1wicGxhY2VfaWRcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGFjZUlkID0gcHJlZGljdGlvbltcInBsYWNlX2lkXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEdFVCAvbWFwcy9hcGkvZ2VvY29kZS9qc29uP3BsYWNlX2lkPXtwbGFjZUlEfX0ma2V5PXtnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2dlb2NvZGluZy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBHb29nbGUgTWFwcyBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoYCR7Z29vZ2xlTWFwc0FQSXNCYXNlVXJsfS9tYXBzL2FwaS9nZW9jb2RlL2pzb24/cGxhY2VfaWQ9JHtwbGFjZUlkfSZrZXk9JHtnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXl9YCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ0dvb2dsZSBNYXBzIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXSAhPT0gbnVsbCAmJiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiYWRkcmVzc19jb21wb25lbnRzXCJdICE9PSB1bmRlZmluZWQgJiYgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImFkZHJlc3NfY29tcG9uZW50c1wiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiYWRkcmVzc19jb21wb25lbnRzXCJdLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGhlIGFwcHJvcHJpYXRlIHJlc3VsdCB3aXRoIGl0cyBhZGRyZXNzX2NvbXBvbmVudHMgaW4gdGhlIGxpc3Qgb2YgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdQcmVkaWN0aW9uOiBMb2NhdGlvblByZWRpY3Rpb25UeXBlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzc19jb21wb25lbnRzOiBKU09OLnN0cmluZ2lmeShnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiYWRkcmVzc19jb21wb25lbnRzXCJdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBwcmVkaWN0aW9uW1wiZGVzY3JpcHRpb25cIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkX3N1YnN0cmluZ3M6IEpTT04uc3RyaW5naWZ5KHByZWRpY3Rpb25bXCJtYXRjaGVkX3N1YnN0cmluZ3NcIl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VfaWQ6IHByZWRpY3Rpb25bXCJwbGFjZV9pZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogcHJlZGljdGlvbltcInJlZmVyZW5jZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cnVjdHVyZWRfZm9ybWF0dGluZzogSlNPTi5zdHJpbmdpZnkocHJlZGljdGlvbltcInN0cnVjdHVyZWRfZm9ybWF0dGluZ1wiXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXJtczogSlNPTi5zdHJpbmdpZnkocHJlZGljdGlvbltcInRlcm1zXCJdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVzOiBwcmVkaWN0aW9uW1widHlwZXNcIl0gYXMgc3RyaW5nW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gobmV3UHJlZGljdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gTGF0dGVyICR7ZW5kcG9pbnRJbmZvfSBQbGFjZXMgQVBJIHJlc3BvbnNlIWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIExhdHRlciAke2VuZHBvaW50SW5mb30gUGxhY2VzIEFQSSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWNlcyBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gUGxhY2VzIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFjZXMgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBMb2NhdGlvbiBQcmVkaWN0aW9ucyAke2dldExvY2F0aW9uUHJlZGljdGlvbnNJbnB1dC5hZGRyZXNzfSB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2VvY29kZSBhIHBhcnRpY3VsYXIgYWRkcmVzcywgZm9yIGEgbG9jYXRpb24gdG8gYmUgcGFzc2VkIGluLlxuICAgICAqXG4gICAgICogQHBhcmFtIGdlb2NvZGVBc3luY0lucHV0IGlucHV0IHBhc3NlZCBpbixcbiAgICAgKiB3aGljaCB3ZSB3aWxsIHJldHJpZXZlIHRoZSBnZW9jb2RlZCBpbmZvcm1hdGlvbiBmb3IuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBHZW9jb2RlQXN5bmNSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgcGFzc2VkIGluIGFkZHJlc3Mnc1xuICAgICAqIGdlb2NvZGVkIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIGdlb0NvZGVBc3luYyhnZW9jb2RlQXN5bmNJbnB1dDogR2VvY29kZUFzeW5jSW5wdXQpOiBQcm9taXNlPEdlb2NvZGVBc3luY1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZW9Db2RlQXN5bmMgR29vZ2xlIE1hcHMgQVBJcyc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIEdlb0NvZGUgdGhlIHBhc3NlZCBpbiBhZGRyZXNzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBbZ29vZ2xlTWFwc0FQSXNCYXNlVXJsLCBnb29nbGVNYXBzQVBJc0lPU1ByaXZhdGVLZXksXG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0FQSXNBbmRyb2lkUHJpdmF0ZUtleSwgZ29vZ2xlTWFwc0FuZHJvaWRTaGEsXG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0JhY2tlZEFQSXNLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuR09PR0xFX01BUFNfQVBJU19JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChnb29nbGVNYXBzQVBJc0Jhc2VVcmwgPT09IG51bGwgfHwgZ29vZ2xlTWFwc0FQSXNCYXNlVXJsLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBUElzSU9TUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBnb29nbGVNYXBzQVBJc0lPU1ByaXZhdGVLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0FQSXNBbmRyb2lkUHJpdmF0ZUtleSA9PT0gdW5kZWZpbmVkIHx8IGdvb2dsZU1hcHNBUElzQW5kcm9pZFByaXZhdGVLZXkgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQVBJc0FuZHJvaWRQcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCB8fCBnb29nbGVNYXBzQW5kcm9pZFNoYSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0FuZHJvaWRTaGEgPT09IG51bGwgfHwgZ29vZ2xlTWFwc0FuZHJvaWRTaGEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0JhY2tlZEFQSXNLZXkgPT09IHVuZGVmaW5lZCB8fCBnb29nbGVNYXBzQmFja2VkQVBJc0tleSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNCYWNrZWRBUElzS2V5Lmxlbmd0aCA9PT0gMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIEdvb2dsZSBNYXBzIEFQSXMgY2FsbHMhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gdGhlIE9TVHlwZSBwYXNzZWQgaW4sIGJ1aWxkIGhlYWRlcnMgYXMgd2VsbCBhcyBrZXlzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBsZXQgZ29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5OiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnM6IGFueSA9IHt9O1xuICAgICAgICAgICAgaWYgKGdlb2NvZGVBc3luY0lucHV0Lm9zVHlwZSA9PT0gT3NUeXBlLklvcykge1xuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBUElzUHJpdmF0ZUtleSA9IGdvb2dsZU1hcHNBUElzSU9TUHJpdmF0ZUtleTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWlvcy1idW5kbGUtaWRlbnRpZmllclwiOiBcImNvbS5tb29uYmVhbS5tb29uYmVhbWZpbmFuY2VcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBUElzUHJpdmF0ZUtleSA9IGdvb2dsZU1hcHNBUElzQW5kcm9pZFByaXZhdGVLZXk7XG4gICAgICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hbmRyb2lkLWNlcnRcIjogYCR7Z29vZ2xlTWFwc0FuZHJvaWRTaGF9YCxcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFuZHJvaWQtcGFja2FnZVwiOiBcImNvbS5tb29uYmVhbS5tb29uYmVhbWZpblwiXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL21hcHMvYXBpL3BsYWNlL2F1dG9jb21wbGV0ZS9qc29uP2lucHV0PXthZGRyZXNzfSZ0eXBlcz1nZW9jb2RlJmtleT17Z29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5fVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL3BsYWNlcy93ZWItc2VydmljZS9hdXRvY29tcGxldGVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgR29vZ2xlIE1hcHMgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7Z29vZ2xlTWFwc0FQSXNCYXNlVXJsfS9tYXBzL2FwaS9wbGFjZS9hdXRvY29tcGxldGUvanNvbj9pbnB1dD0ke2VuY29kZVVSSUNvbXBvbmVudChnZW9jb2RlQXN5bmNJbnB1dC5hZGRyZXNzKX0mdHlwZXM9Z2VvY29kZSZrZXk9JHtnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXl9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ0dvb2dsZSBNYXBzIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlLmRhdGFbXCJwcmVkaWN0aW9uc1wiXSAhPT0gbnVsbCAmJiBnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlLmRhdGFbXCJwcmVkaWN0aW9uc1wiXS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl1bMF1bXCJwbGFjZV9pZFwiXSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdWzBdW1wicGxhY2VfaWRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl1bMF1bXCJwbGFjZV9pZFwiXS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEdvb2dsZSBQbGFjZXMgQXV0b2NvbXBsZXRlIFBsYWNlIElEIHJldHJpZXZlZCB0aHJvdWdoIHRoZSBBUElcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhY2VJRCA9IGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdWzBdW1wicGxhY2VfaWRcIl07XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEdFVCAvbWFwcy9hcGkvZ2VvY29kZS9qc29uP3BsYWNlX2lkPXtwbGFjZUlEfX0ma2V5PXtnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXl9XG4gICAgICAgICAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9nZW9jb2RpbmcvXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBHb29nbGUgTWFwcyBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KGAke2dvb2dsZU1hcHNBUElzQmFzZVVybH0vbWFwcy9hcGkvZ2VvY29kZS9qc29uP3BsYWNlX2lkPSR7cGxhY2VJRH0ma2V5PSR7Z29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5fWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdHb29nbGUgTWFwcyBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXSAhPT0gbnVsbCAmJiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdICE9PSB1bmRlZmluZWQgJiYgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxhdFwiXSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdW1wibGF0XCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl1bXCJsYXRcIl0ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl1bXCJsbmdcIl0gIT09IHVuZGVmaW5lZCAmJiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxuZ1wiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdW1wibG5nXCJdLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIHRoZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlOiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxhdFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGU6IGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdW1wibG5nXCJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gR2VvQ29kZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBHZW9Db2RlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gR2VvQ29kZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWNlcyBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gUGxhY2VzIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFjZXMgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2hcbiAgICAgICAgICAgIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIEdlb0NvZGluZyAke2dlb2NvZGVBc3luY0lucHV0LmFkZHJlc3N9IHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19