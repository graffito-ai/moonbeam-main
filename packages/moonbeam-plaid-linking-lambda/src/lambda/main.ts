import {createPlaidLinkingSession} from "./resolvers/CreatePlaidLinkingSessionResolver";
import {updatePlaidLinkingSession} from "./resolvers/UpdatePlaidLinkingSessionResolver";
import {
    CreatePlaidLinkingSessionInput,
    PlaidLinkingErrorType,
    PlaidLinkingSessionResponse,
    UpdatePlaidLinkingSessionInput
} from "@moonbeam/moonbeam-models";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createPlaidLinkingSessionInput: CreatePlaidLinkingSessionInput,
        updatePlaidLinkingSessionInput: UpdatePlaidLinkingSessionInput
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
 * @returns a {@link Promise} containing a {@link PlaidLinkingSessionResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<PlaidLinkingSessionResponse> => {
    console.log(`Received new Plaid Linking event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createPlaidLinkingSession":
            return await createPlaidLinkingSession(event.info.fieldName, event.arguments.createPlaidLinkingSessionInput);
        case "updatePlaidLinkingSession":
            return await updatePlaidLinkingSession(event.info.fieldName, event.arguments.updatePlaidLinkingSessionInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: PlaidLinkingErrorType.UnexpectedError
            };
    }
}

