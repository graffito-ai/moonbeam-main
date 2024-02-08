import {
    GeocodeAsyncInput,
    GeocodeAsyncResponse,
    GetLocationPredictionsInput,
    GetLocationPredictionsResponse,
    UtilitiesErrorType
} from "@moonbeam/moonbeam-models";
import {geoCodeAsync} from "./resolvers/GeoCodeAsyncResolver";
import {getLocationPredictions} from "./resolvers/GetLocationPredictionsResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        geocodeAsyncInput: GeocodeAsyncInput,
        getLocationPredictionsInput: GetLocationPredictionsInput
    },
    identity: {
        sub: string;
        username: string;
    }
}

/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync even to be passed in the handler
 * @returns a {@link Promise} containing a {@link GeocodeAsyncResponse} or {@link GetLocationPredictionsResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<GeocodeAsyncResponse | GetLocationPredictionsResponse> => {
    console.log(`Received new Utility event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "geoCodeAsync":
            return await geoCodeAsync(event.info.fieldName, event.arguments.geocodeAsyncInput);
        case "getLocationPredictions":
            return await getLocationPredictions(event.info.fieldName, event.arguments.getLocationPredictionsInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: UtilitiesErrorType.UnexpectedError
            };
    }
}

