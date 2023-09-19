import {
    CreateUserAuthSessionInput,
    GetUserAuthSessionInput,
    UpdateUserAuthSessionInput,
    UserAuthSessionErrorType,
    UserAuthSessionResponse
} from "@moonbeam/moonbeam-models";
import {createUserAuthSession} from "./resolvers/CreateUserAuthSessionResolver";
import {getUserAuthSession} from "./resolvers/GetUserAuthSessionResolver";
import { updateUserAuthSession } from "./resolvers/UpdateUserAuthSessionResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createUserAuthSessionInput: CreateUserAuthSessionInput,
        updateUserAuthSessionInput: UpdateUserAuthSessionInput,
        getUserAuthSessionInput: GetUserAuthSessionInput
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
 * @returns a {@link Promise} containing a {@link UserAuthSessionResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<UserAuthSessionResponse> => {
    console.log(`Received new User Auth Session event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getUserAuthSession":
            return await getUserAuthSession(event.info.fieldName, event.arguments.getUserAuthSessionInput);
        case "createUserAuthSession":
            return await createUserAuthSession(event.info.fieldName, event.arguments.createUserAuthSessionInput);
        case "updateUserAuthSession":
            return await updateUserAuthSession(event.info.fieldName, event.arguments.updateUserAuthSessionInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: UserAuthSessionErrorType.UnexpectedError
            };
    }
}

