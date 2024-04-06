import {
    CreateTransactionInput,
    GetTransactionByStatusInput,
    GetTransactionInput,
    MoonbeamTransactionResponse,
    MoonbeamTransactionsByStatusResponse,
    MoonbeamTransactionsResponse, MoonbeamUpdatedTransactionResponse,
    TransactionsErrorType,
    UpdateTransactionInput,
    UserForNotificationReminderResponse
} from "@moonbeam/moonbeam-models";
import {createTransaction} from "./resolvers/CreateTransactionResolver";
import {getTransaction} from "./resolvers/GetTransactionResolver";
import {getTransactionByStatus} from "./resolvers/GetTransactionByStatusResolver";
import {updateTransaction} from "./resolvers/UpdateTransactionResolver";
import { getAllUsersEligibleForReimbursements } from "./resolvers/GetAllUsersEligibleForReimbursementsResolver";
import { getAllUsersIneligibleForReimbursements } from "./resolvers/GetAllUsersIneligibleForReimbursementsResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createTransactionInput: CreateTransactionInput,
        updateTransactionInput: UpdateTransactionInput,
        getTransactionInput: GetTransactionInput,
        getTransactionByStatusInput: GetTransactionByStatusInput
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
 * @returns a {@link Promise} containing a {@link MoonbeamTransactionResponse}, {@link MoonbeamTransactionsResponse},
 * {@link MoonbeamTransactionsByStatusResponse}, {@link MoonbeamUpdatedTransactionResponse} or {@link UserForNotificationReminderResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<MoonbeamTransactionResponse | MoonbeamTransactionsResponse | MoonbeamTransactionsByStatusResponse | MoonbeamUpdatedTransactionResponse | UserForNotificationReminderResponse> => {
    console.log(`Received new transaction event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createTransaction":
            return await createTransaction(event.info.fieldName, event.arguments.createTransactionInput);
        case "updateTransaction":
            return await updateTransaction(event.info.fieldName, event.arguments.updateTransactionInput);
        case "getTransaction":
            return await getTransaction(event.info.fieldName, event.arguments.getTransactionInput);
        case "getTransactionByStatus":
            return await getTransactionByStatus(event.info.fieldName, event.arguments.getTransactionByStatusInput);
        case "getAllUsersEligibleForReimbursements":
            return await getAllUsersEligibleForReimbursements(event.info.fieldName);
        case "getAllUsersIneligibleForReimbursements":
            return await getAllUsersIneligibleForReimbursements(event.info.fieldName);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
            };
    }
}

