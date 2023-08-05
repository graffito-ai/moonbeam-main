import {
    AddCardInput,
    CardLinkErrorType,
    CardLinkResponse, CardResponse,
    CreateCardLinkInput,
    DeleteCardInput, EligibleLinkedUsersResponse,
    GetCardLinkInput
} from "@moonbeam/moonbeam-models";
import {createCardLink} from "./resolvers/CreateCardLinkResolver";
import { deleteCard } from "./resolvers/DeleteCardResolver";
import { getCardLink } from "./resolvers/GetCardLinkResolver";
import {addCard} from "./resolvers/AddCardResolver";
import { getEligibleLinkedUsers } from "./resolvers/GetEligibleLinkedUsersResolver";

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
 * @returns a {@link Promise} containing a {@link CardLinkResponse} or {@link CardResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<CardLinkResponse | CardResponse | EligibleLinkedUsersResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "addCard":
            return await addCard(event.info.fieldName, event.arguments.addCardInput);
        case "getCardLink":
            return await getCardLink(event.info.fieldName, event.arguments.getCardLinkInput);
        case "getEligibleLinkedUsers":
            return await getEligibleLinkedUsers(event.info.fieldName);
        case "createCardLink":
            return await createCardLink(event.info.fieldName, event.arguments.createCardLinkInput);
        case "deleteCard":
            return await deleteCard(event.info.fieldName, event.arguments.deleteCardInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            };
    }
}

