import {CreateFaqInput, FaqErrorType, FaqResponse} from "@moonbeam/moonbeam-models";
import {createFAQ} from "./resolvers/CreateFAQResolver";
import { getFAQs } from "./resolvers/GetFAQsResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createFAQInput: CreateFaqInput
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
 * @returns a {@link Promise} containing a {@link FaqResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<FaqResponse> => {
    console.log(`Received new FAQ event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getFAQs":
            return await getFAQs(event.info.fieldName);
        case "createFAQ":
            return await createFAQ(event.info.fieldName, event.arguments.createFAQInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: FaqErrorType.UnexpectedError
            };
    }
}

