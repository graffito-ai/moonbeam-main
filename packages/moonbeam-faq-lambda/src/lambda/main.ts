import {CreateFaqInput, FaqErrorType, FaqResponse, ListFaqInput} from "@moonbeam/moonbeam-models";
import {createFAQ} from "./resolvers/createFAQ";
import {listFAQs} from "./resolvers/listFAQs";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        listFAQInput: ListFaqInput
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
 */
exports.handler = async (event: AppSyncEvent): Promise<FaqResponse> => {
    console.log(`Received new FAQ event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "listFAQs":
            return await listFAQs(event.arguments.listFAQInput);
        case "createFAQ":
            return await createFAQ(event.arguments.createFAQInput);
        default:
            console.log(`Unexpected field name: {}`, event.info.fieldName);
            return {
                errorMessage: `Unexpected field name: ${event.info.fieldName}`,
                errorType: FaqErrorType.UnexpectedError
            };
    }
}

