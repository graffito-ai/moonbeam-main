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
     * @param address which we will retrieve the geocoded information for.
     *
     * @returns a {@link GeocodeAsyncResponse}, representing the passed in address's
     * geocoded information.
     */
    async geoCodeAsync(address) {
        // easily identifiable API endpoint information
        const endpointInfo = 'geoCodeAsync Google Maps APIs';
        try {
            // retrieve the API Key and Base URL, needed in order to GeoCode the passed in address accordingly
            const [googleMapsAPIsBaseUrl, googleMapsAPIsPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.GOOGLE_MAPS_APIS_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (googleMapsAPIsBaseUrl === null || googleMapsAPIsBaseUrl.length === 0 ||
                googleMapsAPIsPrivateKey === null || googleMapsAPIsPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Google Maps APIs calls!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
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
            return axios_1.default.get(`${googleMapsAPIsBaseUrl}/maps/api/place/autocomplete/json?input=${address}&types=geocode&key=${googleMapsAPIsPrivateKey}`, {
                headers: {
                    "Content-Type": "application/json"
                },
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
                     *
                     *
                     * GET /maps/api/geocode/json?place_id={placeID}}&key={googleMapsAPIsPrivateKey}
                     * @link https://developers.google.com/maps/documentation/geocoding/
                     *
                     * build the Google Maps API request body to be passed in, and perform a GET to it with the appropriate information
                     * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
                     * error for a better customer experience.
                     */
                    return axios_1.default.get(`${googleMapsAPIsBaseUrl}/maps/api/geocode/json?place_id=${placeID}&key=${googleMapsAPIsPrivateKey}`, {
                        headers: {
                            "Content-Type": "application/json"
                        },
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
            const errorMessage = `Unexpected error while GeoCoding ${address} through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.UtilitiesErrorType.UnexpectedError
            };
        }
    }
}
exports.GoogleMapsClient = GoogleMapsClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29vZ2xlTWFwc0NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9Hb29nbGVNYXBzQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFBMkU7QUFDM0UsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEsNkJBQWE7SUFFL0M7Ozs7O09BS0c7SUFDSCxZQUFZLFdBQW1CLEVBQUUsTUFBYztRQUMzQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFlO1FBQzlCLCtDQUErQztRQUMvQyxNQUFNLFlBQVksR0FBRywrQkFBK0IsQ0FBQztRQUVyRCxJQUFJO1lBQ0Esa0dBQWtHO1lBQ2xHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSx3QkFBd0IsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUVuSyw0RUFBNEU7WUFDNUUsSUFBSSxxQkFBcUIsS0FBSyxJQUFJLElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3BFLHdCQUF3QixLQUFLLElBQUksSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM1RSxNQUFNLFlBQVksR0FBRyxzREFBc0QsQ0FBQztnQkFDNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLG1DQUFrQixDQUFDLGVBQWU7aUJBQ2hELENBQUM7YUFDTDtZQUVEOzs7Ozs7O2VBT0c7WUFDSCxPQUFPLGVBQUssQ0FBQyxHQUFHLENBQUMs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QUFFLENBQUM7b0JBQ3RKLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBRTFCLE9BQU87d0JBQ0gsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSxtQ0FBa0IsQ0FBQyxlQUFlO3FCQUNoRCxDQUFDO2lCQUNMO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLE9BQU8sWUFBWSxZQUFZLEVBQUUsQ0FBQztZQUMzRixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFdEMsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG1DQUFrQixDQUFDLGVBQWU7YUFDaEQsQ0FBQztTQUNMO0lBQ0wsQ0FBQztDQUNKO0FBOU1ELDRDQThNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIi4vQmFzZUFQSUNsaWVudFwiO1xuaW1wb3J0IHtHZW9jb2RlQXN5bmNSZXNwb25zZSwgVXRpbGl0aWVzRXJyb3JUeXBlfSBmcm9tIFwiLi4vR3JhcGhxbEV4cG9ydHNcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiLi4vQ29uc3RhbnRzXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIEdvb2dsZSBNYXBzIEFQSXMgY2FsbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBHb29nbGVNYXBzQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgY2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVudmlyb25tZW50IHRoZSBBV1MgZW52aXJvbm1lbnQgcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKiBAcGFyYW0gcmVnaW9uIHRoZSBBV1MgcmVnaW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocmVnaW9uLCBlbnZpcm9ubWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZW9jb2RlIGEgcGFydGljdWxhciBhZGRyZXNzLCBmb3IgYSBsb2NhdGlvbiB0byBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYWRkcmVzcyB3aGljaCB3ZSB3aWxsIHJldHJpZXZlIHRoZSBnZW9jb2RlZCBpbmZvcm1hdGlvbiBmb3IuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBHZW9jb2RlQXN5bmNSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgcGFzc2VkIGluIGFkZHJlc3Mnc1xuICAgICAqIGdlb2NvZGVkIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgIGFzeW5jIGdlb0NvZGVBc3luYyhhZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPEdlb2NvZGVBc3luY1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZW9Db2RlQXN5bmMgR29vZ2xlIE1hcHMgQVBJcyc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIEdlb0NvZGUgdGhlIHBhc3NlZCBpbiBhZGRyZXNzIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBbZ29vZ2xlTWFwc0FQSXNCYXNlVXJsLCBnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuR09PR0xFX01BUFNfQVBJU19JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChnb29nbGVNYXBzQVBJc0Jhc2VVcmwgPT09IG51bGwgfHwgZ29vZ2xlTWFwc0FQSXNCYXNlVXJsLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBUElzUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIEdvb2dsZSBNYXBzIEFQSXMgY2FsbHMhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdFVCAvbWFwcy9hcGkvcGxhY2UvYXV0b2NvbXBsZXRlL2pzb24/aW5wdXQ9e2FkZHJlc3N9JnR5cGVzPWdlb2NvZGUma2V5PXtnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXl9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vcGxhY2VzL3dlYi1zZXJ2aWNlL2F1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBHb29nbGUgTWFwcyBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtnb29nbGVNYXBzQVBJc0Jhc2VVcmx9L21hcHMvYXBpL3BsYWNlL2F1dG9jb21wbGV0ZS9qc29uP2lucHV0PSR7YWRkcmVzc30mdHlwZXM9Z2VvY29kZSZrZXk9JHtnb29nbGVNYXBzQVBJc1ByaXZhdGVLZXl9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdHb29nbGUgTWFwcyBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl0gIT09IG51bGwgJiYgZ29vZ2xlTWFwc0F1dG9Db21wbGV0ZWRSZXNwb25zZS5kYXRhW1wicHJlZGljdGlvbnNcIl0ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdWzBdW1wicGxhY2VfaWRcIl0gIT09IHVuZGVmaW5lZCAmJiBnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlLmRhdGFbXCJwcmVkaWN0aW9uc1wiXVswXVtcInBsYWNlX2lkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNBdXRvQ29tcGxldGVkUmVzcG9uc2UuZGF0YVtcInByZWRpY3Rpb25zXCJdWzBdW1wicGxhY2VfaWRcIl0ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBHb29nbGUgUGxhY2VzIEF1dG9jb21wbGV0ZSBQbGFjZSBJRCByZXRyaWV2ZWQgdGhyb3VnaCB0aGUgQVBJXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlSUQgPSBnb29nbGVNYXBzQXV0b0NvbXBsZXRlZFJlc3BvbnNlLmRhdGFbXCJwcmVkaWN0aW9uc1wiXVswXVtcInBsYWNlX2lkXCJdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBHRVQgL21hcHMvYXBpL2dlb2NvZGUvanNvbj9wbGFjZV9pZD17cGxhY2VJRH19JmtleT17Z29vZ2xlTWFwc0FQSXNQcml2YXRlS2V5fVxuICAgICAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vZ2VvY29kaW5nL1xuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBidWlsZCB0aGUgR29vZ2xlIE1hcHMgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtnb29nbGVNYXBzQVBJc0Jhc2VVcmx9L21hcHMvYXBpL2dlb2NvZGUvanNvbj9wbGFjZV9pZD0ke3BsYWNlSUR9JmtleT0ke2dvb2dsZU1hcHNBUElzUHJpdmF0ZUtleX1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdHb29nbGUgTWFwcyBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXSAhPT0gbnVsbCAmJiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdICE9PSB1bmRlZmluZWQgJiYgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxhdFwiXSAhPT0gdW5kZWZpbmVkICYmIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdW1wibGF0XCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl1bXCJsYXRcIl0ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwc0dlb0NvZGVSZXNwb25zZS5kYXRhW1wicmVzdWx0c1wiXVswXVtcImdlb21ldHJ5XCJdW1wibG9jYXRpb25cIl1bXCJsbmdcIl0gIT09IHVuZGVmaW5lZCAmJiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxuZ1wiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdW1wibG5nXCJdLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIHRoZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlOiBnb29nbGVNYXBzR2VvQ29kZVJlc3BvbnNlLmRhdGFbXCJyZXN1bHRzXCJdWzBdW1wiZ2VvbWV0cnlcIl1bXCJsb2NhdGlvblwiXVtcImxhdFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGU6IGdvb2dsZU1hcHNHZW9Db2RlUmVzcG9uc2UuZGF0YVtcInJlc3VsdHNcIl1bMF1bXCJnZW9tZXRyeVwiXVtcImxvY2F0aW9uXCJdW1wibG5nXCJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gR2VvQ29kZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBHZW9Db2RlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gR2VvQ29kZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWNlcyBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXRpbGl0aWVzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gUGxhY2VzIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFjZXMgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVdGlsaXRpZXNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgR2VvQ29kaW5nICR7YWRkcmVzc30gdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFV0aWxpdGllc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=