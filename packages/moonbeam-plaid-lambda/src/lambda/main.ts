import {
    AccountLinkResponse, AccountResponse,
    CreateAccountLinkInput, DeleteAccountInput,
    LinkErrorType, ListAccountsInput,
    UpdateAccountLinkInput
} from "@moonbeam/moonbeam-models";
import {createAccountLink} from "./resolvers/createAccountLink";
import {updateAccountLink} from "./resolvers/updateAccountLink";
import {getAccountLink} from "./resolvers/getAccountLink";
import {listAccounts} from "./resolvers/listAccounts";
import {deleteAccount} from "./resolvers/deleteAccount";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        id: string,
        filter: ListAccountsInput,
        createAccountLinkInput: CreateAccountLinkInput,
        updateAccountLinkInput: UpdateAccountLinkInput,
        deleteAccountInput: DeleteAccountInput
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
exports.handler = async (event: AppSyncEvent): Promise<AccountLinkResponse | AccountResponse> => {
    console.log(`Received new Plaid link event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getAccountLink":
            return await getAccountLink(event.arguments.id);
        case "listAccounts":
            return await listAccounts(event.arguments.filter);
        case "createAccountLink":
            return await createAccountLink(event.arguments.createAccountLinkInput);
        case "updateAccountLink":
            return await updateAccountLink(event.arguments.updateAccountLinkInput);
        case "deleteAccount":
            return await deleteAccount(event.arguments.deleteAccountInput);
        default:
            console.log(`Unexpected field name: {}`, event.info.fieldName);
            return {
                errorMessage: `Unexpected field name: ${event.info.fieldName}`,
                errorType: LinkErrorType.UnexpectedError
            };
    }
}

