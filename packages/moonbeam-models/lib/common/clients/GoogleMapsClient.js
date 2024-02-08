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
            return axios_1.default.get(`${googleMapsAPIsBaseUrl}/maps/api/place/autocomplete/json?input=${geocodeAsyncInput.address}&types=geocode&key=${googleMapsAPIsPrivateKey}`, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29vZ2xlTWFwc0NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9Hb29nbGVNYXBzQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFBc0c7QUFDdEcsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEsNkJBQWE7SUFFL0M7Ozs7O09BS0c7SUFDSCxZQUFZLFdBQW1CLEVBQUUsTUFBYztRQUMzQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxpQkFBb0M7UUFDbkQsK0NBQStDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLCtCQUErQixDQUFDO1FBRXJELElBQUk7WUFDQSxrR0FBa0c7WUFDbEcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLDJCQUEyQixFQUNyRCwrQkFBK0IsRUFBRSxvQkFBb0IsRUFDckQsdUJBQXVCLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFFeEksNEVBQTRFO1lBQzVFLElBQUkscUJBQXFCLEtBQUssSUFBSSxJQUFJLHFCQUFxQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUNwRSwyQkFBMkIsS0FBSyxJQUFJLElBQUksMkJBQTJCLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ2hGLCtCQUErQixLQUFLLFNBQVMsSUFBSSwrQkFBK0IsS0FBSyxJQUFJO2dCQUN6RiwrQkFBK0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLG9CQUFvQixLQUFLLFNBQVM7Z0JBQ2xGLG9CQUFvQixLQUFLLElBQUksSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDbEUsdUJB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QUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFdEMsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG1DQUFrQixDQUFDLGVBQWU7YUFDaEQsQ0FBQztTQUNMO0lBQ0wsQ0FBQztDQUNKO0FBcE9ELDRDQW9PQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIi4vQmFzZUFQSUNsaWVudFwiO1xuaW1wb3J0IHtHZW9jb2RlQXN5bmNJbnB1dCwgR2VvY29kZUFzeW5jUmVzcG9uc2UsIE9zVHlwZSwgVXRpbGl0aWVzRXJyb3JUeXBlfSBmcm9tIFwiLi4vR3JhcGhxbEV4cG9ydHNcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiLi4vQ29uc3RhbnRzXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIEdvb2dsZSBNYXBzIEFQSXMgY2FsbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBHb29nbGVNYXBzQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgY2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVudmlyb25tZW50IHRoZSBBV1MgZW52aXJvbm1lbnQgcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKiBAcGFyYW0gcmVnaW9uIHRoZSBBV1MgcmVnaW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocmVnaW9uLCBlbnZpcm9ubWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZW9jb2RlIGEgcGFydGljdWxhciBhZGRyZXNzLCBmb3IgYSBsb2NhdGlvbiB0byBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2VvY29kZUFzeW5jSW5wdXQgaW5wdXQgcGFzc2VkIGluLFxuICAgICAqIHdoaWNoIHdlIHdpbGwgcmV0cmlldmUgdGhlIGdlb2NvZGVkIGluZm9ybWF0aW9uIGZvci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIEdlb2NvZGVBc3luY1Jlc3BvbnNlfSwgcmVwcmVzZW50aW5nIHRoZSBwYXNzZWQgaW4gYWRkcmVzcydzXG4gICAgICogZ2VvY29kZWQgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgYXN5bmMgZ2VvQ29kZUFzeW5jKGdlb2NvZGVBc3luY0lucHV0OiBHZW9jb2RlQXN5bmNJbnB1dCk6IFByb21pc2U8R2VvY29kZUFzeW5jUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dlb0NvZGVBc3luYyBHb29nbGUgTWFwcyBBUElzJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gR2VvQ29kZSB0aGUgcGFzc2VkIGluIGFkZHJlc3MgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGNvbnN0IFtnb29nbGVNYXBzQVBJc0Jhc2VVcmwsIGdvb2dsZU1hcHNBUElzSU9TUHJpdmF0ZUtleSxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQVBJc0FuZHJvaWRQcml2YXRlS2V5LCBnb29nbGVNYXBzQW5kcm9pZFNoYSxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQmFja2VkQVBJc0tleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5HT09HTEVfTUFQU19BUElTX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGdvb2dsZU1hcHNBUElzQmFzZVVybCA9PT0gbnVsbCB8fCBnb29nbGVNYXBzQVBJc0Jhc2VVcmwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0FQSXNJT1NQcml2YXRlS2V5ID09PSBudWxsIHx8IGdvb2dsZU1hcHNBUElzSU9TUHJpdmF0ZUtleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQVBJc0FuZHJvaWRQcml2YXRlS2V5ID09PSB1bmRlZmluZWQgfHwgZ29vZ2xlTWFwc0FQSXNBbmRyb2lkUHJpdmF0ZUtleSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBUElzQW5kcm9pZFByaXZhdGVLZXkubGVuZ3RoID09PSAwIHx8IGdvb2dsZU1hcHNBbmRyb2lkU2hhID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQW5kcm9pZFNoYSA9PT0gbnVsbCB8fCBnb29nbGVNYXBzQW5kcm9pZFNoYS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBnb29nbGVNYXBzQmFja2VkQVBJc0tleSA9PT0gdW5kZWZpbmVkIHx8IGdvb2dsZU1hcHNCYWNrZWRBUElzS2V5ID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0JhY2tlZEFQSXNLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIEdvb2dsZSBNYXBzIEFQSXMgY2FsbHMhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gdGhlIE9TVHlwZSBwYXNzZWQgaW4sIGJ1aWxkIGhlYWRlcnMgYXMgd2VsbCBhcyBrZXlzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBsZXQgZ29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5OiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnM6IGFueSA9IHt9O1xuICAgICAgICAgICAgaWYgKGdlb2NvZGVBc3luY0lucHV0Lm9zVHlwZSA9PT0gT3NUeXBlLklvcykge1xuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBUElzUHJpdmF0ZUtleSA9IGdvb2dsZU1hcHNBUElzSU9TUHJpdmF0ZUtleTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWlvcy1idW5kbGUtaWRlbnRpZmllclwiOiBcImNvbS5tb29uYmVhbS5tb29uYmVhbWZpbmFuY2VcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBUElzUHJpdmF0ZUtleSA9IGdvb2dsZU1hcHNBUElzQW5kcm9pZFByaXZhdGVLZXk7XG4gICAgICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hbmRyb2lkLWNlcnRcIjogYCR7Z29vZ2xlTWFwc0FuZHJvaWRTaGF9YCxcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFuZHJvaWQtcGFja2FnZVwiOiBcImNvbS5tb29uYmVhbS5tb29uYmVhbWZpblwiXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL21hcHMvYXBpL3BsYWNlL2F1dG9jb21wbGV0ZS9qc29uP2lucHV0PXthZGRyZXNzfSZ0eXBlcz1nZW9jb2RlJmtleT17Z29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5fVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL3BsYWNlcy93ZWItc2VydmljZS9hdXRvY29tcGxldGVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgR29vZ2xlIE1hcHMgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7Z29vZ2xlTWFwc0FQSXNCYXNlVXJsfS9tYXBzL2FwaS9wbGFjZS9hdXRvY29tcGxldGUvanNvbj9pbnB1dD0ke2dlb2NvZGVBc3luY0lucHV0LmFkZHJlc3N9JnR5cGVzPWdlb2NvZGUma2V5PSR7Z29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5fWAsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdHb29nbGUgTWFwcyBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl0gIT09IG51bGwgJiYgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl0ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdWzBdW1wicGxhY2VfaWRcIl0gIT09IHVuZGVmaW5lZCAmJiBnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlLmRhdGFbXCJwcmVkaWN0aW9uc1wiXVswXVtcInBsYWNlX2lkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdWzBdW1wicGxhY2VfaWRcIl0ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBHb29nbGUgUGxhY2VzIEF1dG9jb21wbGV0ZSBQbGFjZSBJRCByZXRyaWV2ZWQgdGhyb3VnaCB0aGUgQVBJXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlSUQgPSBnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlLmRhdGFbXCJwcmVkaWN0aW9uc1wiXVswXVtcInBsYWNlX2lkXCJdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBHRVQgL21hcHMvYXBpL2dlb2NvZGUvanNvbj9wbGFjZV9pZD17cGxhY2VJRH19JmtleT17Z29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5fVxuICAgICAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vZ2VvY29kaW5nL1xuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBidWlsZCB0aGUgR29vZ2xlIE1hcHMgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtnb29nbGVNYXBzQVBJc0Jhc2VVcmx9L21hcHMvYXBpL2dlb2NvZGUvanNvbj9wbGFjZV9pZD0ke3BsYWNlSUR9JmtleT0ke2dvb2dsZU1hcHNBUElzUHJpdmF0ZUtleX1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnR29vZ2xlIE1hcHMgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbihnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl0gIT09IG51bGwgJiYgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl0gIT09IHVuZGVmaW5lZCAmJiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl1bXCJsYXRcIl0gIT09IHVuZGVmaW5lZCAmJiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxhdFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdW1wibGF0XCJdLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdW1wibG5nXCJdICE9PSB1bmRlZmluZWQgJiYgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl1bXCJsbmdcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxuZ1wiXS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJldHJpZXZlZCB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZTogZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl1bXCJsYXRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxuZ1wiXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IEdlb0NvZGUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gR2VvQ29kZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IEdlb0NvZGUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFjZXMgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWNlcyBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gUGxhY2VzIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIEdlb0NvZGluZyAke2dlb2NvZGVBc3luY0lucHV0LmFkZHJlc3N9IHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19