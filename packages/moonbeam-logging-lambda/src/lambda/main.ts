import {CreateLogEventInput, LoggingErrorType, LoggingResponse} from "@moonbeam/moonbeam-models";
import { createLogEvent } from "./resolvers/CreateLogEventResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createLogEventInput: CreateLogEventInput
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
 * @returns a {@link Promise} containing a {@link LoggingResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<LoggingResponse> => {
    console.log(`Received new log event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createLogEvent":
            return await createLogEvent(
                event.identity && event.identity.sub
                    ? event.identity.sub
                    : 'unauthenticated',
                event.info.fieldName,
                event.arguments.createLogEventInput
            );
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: LoggingErrorType.UnexpectedError
            };
    }
}

