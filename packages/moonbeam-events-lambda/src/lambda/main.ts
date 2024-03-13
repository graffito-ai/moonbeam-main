import {CreateEventSeriesInput, EventSeriesResponse, EventsErrorType} from "@moonbeam/moonbeam-models";
import { createEventSeries } from "./resolvers/CreateEventSeriesResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createEventSeriesInput: CreateEventSeriesInput,
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
 * @returns a {@link Promise} containing a {@link EventSeriesResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<EventSeriesResponse> => {
    console.log(`Received new Events/Event Series event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getEventSeries":
            return await getEventSeries(event.info.fieldName);
        case "createEventSeries":
            return await createEventSeries(event.info.fieldName, event.arguments.createEventSeriesInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: EventsErrorType.UnexpectedError
            };
    }
}

