import {createPlaidLinkingSession} from "./resolvers/CreatePlaidLinkingSessionResolver";
import {updatePlaidLinkingSession} from "./resolvers/UpdatePlaidLinkingSessionResolver";
import {
    CreatePlaidLinkingSessionInput, GetPlaidLinkingSessionByTokenInput,
    PlaidLinkingErrorType,
    PlaidLinkingSessionResponse,
    UpdatePlaidLinkingSessionInput, UpdatePlaidLinkingSessionResponse
} from "@moonbeam/moonbeam-models";
import { getPlaidLinkingSessionByToken } from "./resolvers/GetPlaidLinkingSessionByTokenResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createPlaidLinkingSessionInput: CreatePlaidLinkingSessionInput,
        updatePlaidLinkingSessionInput: UpdatePlaidLinkingSessionInput,
        getPlaidLinkingSessionByTokenInput: GetPlaidLinkingSessionByTokenInput
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
 * @param event AppSync event to be passed in the handler
 * @returns a {@link Promise} containing a {@link PlaidLinkingSessionResponse} or {@link UpdatePlaidLinkingSessionResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<PlaidLinkingSessionResponse | UpdatePlaidLinkingSessionResponse> => {
    console.log(`Received new Plaid Linking event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createPlaidLinkingSession":
            return await createPlaidLinkingSession(event.info.fieldName, event.arguments.createPlaidLinkingSessionInput);
        case "updatePlaidLinkingSession":
            return await updatePlaidLinkingSession(event.info.fieldName, event.arguments.updatePlaidLinkingSessionInput);
        case "getPlaidLinkingSessionByToken":
            return await getPlaidLinkingSessionByToken(event.info.fieldName, event.arguments.getPlaidLinkingSessionByTokenInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: PlaidLinkingErrorType.UnexpectedError
            };
    }
}

