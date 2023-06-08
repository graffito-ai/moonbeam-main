import {
    CardLinkErrorType,
    CardLinkResponse,
    CreateCardLinkInput,
    DeleteCardInput,
    GetCardLinkInput
} from "@moonbeam/moonbeam-models";
import {createCardLink} from "./resolvers/CreateCardLinkResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getCardLinkInput: GetCardLinkInput,
        createdCardLinkInput: CreateCardLinkInput,
        deleteCardInput: DeleteCardInput
    },
    identity: {
        sub : string;
        username : string;
    }
}

/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync event to be passed in the handler
 */
exports.handler = async (event: AppSyncEvent): Promise<CardLinkResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createCardLink":
            return await createCardLink(event.arguments.createdCardLinkInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            };
    }
}

