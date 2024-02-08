import {LoggingLevel} from "@moonbeam/moonbeam-models";
import {logEvent} from "./AppSync";
import {PredictionType} from "../models/PredictionType";
import axios from "axios/index";
import {Platform} from "react-native";
import Constants from "expo-constants";

/**
 * Function used to retrieve address line predictions using Google Maps APIs.
 *
 * @param address address to used while retrieving predictions.
 *
 * @return an {@link Array} of {@link PredictionType} objects, representing the returned
 * address predictions.
 */
export const searchAddressPredictions = async (address: string): Promise<PredictionType[]> => {
    // sanitize address and remove any duplicates
    let sanitizedAddress = address.trimStart().trimEnd().trim();
    sanitizedAddress = Array.from(new Set(sanitizedAddress.split(','))).toString();

    try {
        /**
         * base URL to call for Google APIs.
         */
        const googleMapsAPIsBaseUrl = 'https://maps.googleapis.com';
        let googleMapsAPIsPrivateKey: string = "";
        let headers: any = {};
        if (Platform.OS === 'ios') {
            // @ts-ignore
            googleMapsAPIsPrivateKey = `${Constants.expoConfig.extra.GOOGLE_MAPS_APIS_IOS_KEY}`;
            headers = {
                "Content-Type": "application/json",
                // @ts-ignore
                "X-Ios-Bundle-Identifier": `${Constants.expoConfig.extra.IOS_BUNDLE_IDENTIFIER}`
            };
        } else {
            // @ts-ignore
            googleMapsAPIsPrivateKey = `${Constants.expoConfig.extra.GOOGLE_MAPS_APIS_ANDROID_KEY}`;
            headers = {
                "Content-Type": "application/json",
                // @ts-ignore
                "X-Android-Certificate": `${Constants.expoConfig.extra.GOOGLE_MAPS_ANDROID_SHA}`,
                // @ts-ignore
                "X-Android-Package": `${Constants.expoConfig.extra.ANDROID_PACKAGE}`
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
        return axios.get(`${googleMapsAPIsBaseUrl}/maps/api/place/autocomplete/json?key=${googleMapsAPIsPrivateKey}&input=${address}&types=address&components=country:us&language=en`, {
            headers: headers,
            timeout: 15000, // in milliseconds here
            timeoutErrorMessage: 'Google Maps API timed out after 15000ms!'
        }).then(async googleMapsAutoCompletedResponse => {
            // results to be returned
            let results: PredictionType[] = [];

            /**
             * if we reached this, then we assume that a 2xx response code was returned.
             * check the contents of the response, and act appropriately.
             */
            if (googleMapsAutoCompletedResponse.data !== undefined && googleMapsAutoCompletedResponse.data["predictions"] !== undefined &&
                googleMapsAutoCompletedResponse.data["predictions"] !== null && googleMapsAutoCompletedResponse.data["predictions"].length !== 0) {
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
                        const googleMapsGeoCodeResponse = await axios.get(`${googleMapsAPIsBaseUrl}/maps/api/geocode/json?place_id=${placeId}&key=${googleMapsAPIsPrivateKey}`, {
                            headers: headers,
                            timeout: 15000, // in milliseconds here
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
                            results.push({
                                ...prediction,
                                address_components: googleMapsGeoCodeResponse.data["results"][0]["address_components"]
                            } as PredictionType);
                        } else {
                            const errorMessage = `Invalid response structure returned from Latter Places API response!`
                            console.log(errorMessage);
                            await logEvent(errorMessage, LoggingLevel.Error, true);
                        }
                    }
                }
                return results;
            } else {
                const errorMessage = `Invalid response structure returned from Initial Places API response!`
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Error, true);

                return [];
            }
        }).catch(async error => {
            if (error.response) {
                /**
                 * The request was made and the server responded with a status code
                 * that falls out of the range of 2xx.
                 */
                const errorMessage = `Non 2xxx response while calling the Initial Places API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Error, true);

                return [];
            } else if (error.request) {
                /**
                 * The request was made but no response was received
                 * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                 *  http.ClientRequest in node.js.
                 */
                const errorMessage = `No response received while calling the Initial Places API, for request ${error.request}`;
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Error, true);

                return [];
            } else {
                // Something happened in setting up the request that triggered an Error
                const errorMessage = `Unexpected error while setting up the request for the Initial Places API, ${(error && error.message) && error.message}`;
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Error, true);

                return [];
            }
        });
    } catch (error) {
        // return that the results and print an error in case there was an unexpected error while attempting to retrieve address predictions
        const message = `Unexpected error while retrieving address predictions for ${sanitizedAddress}, ${JSON.stringify(error)} ${error}`;
        console.log(message);
        await logEvent(message, LoggingLevel.Error, true);

        return [];
    }
}
