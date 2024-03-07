import {
    AddCardInput,
    CardLinkErrorType,
    CardLinkResponse,
    CardResponse,
    CreateCardLinkInput,
    DeleteCardInput,
    EligibleLinkedUsersResponse,
    GetCardLinkInput,
    GetUserCardLinkingIdInput,
    GetUserCardLinkingIdResponse,
    IneligibleLinkedUsersResponse,
    UpdateCardInput
} from "@moonbeam/moonbeam-models";
import {createCardLink} from "./resolvers/CreateCardLinkResolver";
import { deleteCard } from "./resolvers/DeleteCardResolver";
import { getCardLink } from "./resolvers/GetCardLinkResolver";
import {addCard} from "./resolvers/AddCardResolver";
import { getEligibleLinkedUsers } from "./resolvers/GetEligibleLinkedUsersResolver";
import {getUsersWithNoCards} from "./resolvers/GetUsersWithNoCardsResolver";
import {getUserCardLinkingId} from "./resolvers/GetUserCardLinkingIdResolver";
import {updateCard} from "./resolvers/UpdateCardResolver";

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
        deleteCardInput: DeleteCardInput,
        getUserCardLinkingIdInput: GetUserCardLinkingIdInput,
        updateCardInput: UpdateCardInput
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
 * @returns a {@link Promise} containing a {@link CardLinkResponse}, {@link CardResponse}, {@link EligibleLinkedUsersResponse}, {@link IneligibleLinkedUsersResponse} or {@link GetUserCardLinkingIdResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<CardLinkResponse | CardResponse | EligibleLinkedUsersResponse | IneligibleLinkedUsersResponse | GetUserCardLinkingIdResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "addCard":
            return await addCard(event.info.fieldName, event.arguments.addCardInput);
        case "getUserCardLinkingId":
            return await getUserCardLinkingId(event.info.fieldName, event.arguments.getUserCardLinkingIdInput);
        case "getCardLink":
            return await getCardLink(event.info.fieldName, event.arguments.getCardLinkInput);
        case "getEligibleLinkedUsers":
            return await getEligibleLinkedUsers(event.info.fieldName);
        case 'getUsersWithNoCards':
            return await getUsersWithNoCards(event.info.fieldName);
        case "createCardLink":
            return await createCardLink(event.info.fieldName, event.arguments.createCardLinkInput);
        case "deleteCard":
            return await deleteCard(event.info.fieldName, event.arguments.deleteCardInput);
        case "updateCard":
            return await updateCard(event.info.fieldName, event.arguments.updateCardInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            };
    }
}

