import {
    AccountLinkResponse,
    CreateAccountLinkInput,
    LinkErrorType,
    UpdateAccountLinkInput
} from "@moonbeam/moonbeam-models";
import {createAccountLink} from "./resolvers/createAccountLink";
import {updateAccountLink} from "./resolvers/updateAccountLink";
import {getAccountLink} from "./resolvers/getAccountLink";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        id: string,
        createAccountLinkInput: CreateAccountLinkInput,
        updateAccountLinkInput: UpdateAccountLinkInput
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
 * @param event AppSync even to be passed in the handler
 */
exports.handler = async (event: AppSyncEvent): Promise<AccountLinkResponse> => {
    console.log(`Received new referral event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getAccountLink":
            return await getAccountLink(event.arguments.id);
        case "createAccountLink":
            return await createAccountLink(event.arguments.createAccountLinkInput);
        case "updateAccountLink":
            return await updateAccountLink(event.arguments.updateAccountLinkInput);
        default:
            console.log(`Unexpected field name: {}`, event.info.fieldName);
            return {
                errorMessage: `Unexpected field name: ${event.info.fieldName}`,
                errorType: LinkErrorType.UnexpectedError
            };
    }
}

