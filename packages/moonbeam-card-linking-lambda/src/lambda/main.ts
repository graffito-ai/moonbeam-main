import {
    AddCardInput,
    CardLinkErrorType,
    CardLinkResponse, CardResponse,
    CreateCardLinkInput,
    DeleteCardInput,
    GetCardLinkInput
} from "@moonbeam/moonbeam-models";
import {createCardLink} from "./resolvers/CreateCardLinkResolver";
import { deleteCard } from "./resolvers/DeleteCardResolver";
import { getCardLink } from "./resolvers/GetCardLinkResolver";
import {addCard} from "./resolvers/AddCardResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        addCardInput: AddCardInput,
        getCardLinkInput: GetCardLinkInput,
        createCardLinkInput: CreateCardLinkInput,
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
exports.handler = async (event: AppSyncEvent): Promise<CardLinkResponse | CardResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "addCard":
            return await addCard(event.arguments.addCardInput);
        case "getCardLink":
            return await getCardLink(event.arguments.getCardLinkInput);
        case "createCardLink":
            return await createCardLink(event.arguments.createCardLinkInput);
        case "deleteCard":
            return await deleteCard(event.arguments.deleteCardInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            };
    }
}

