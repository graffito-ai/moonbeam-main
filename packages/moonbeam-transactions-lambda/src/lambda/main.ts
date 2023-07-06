import {
    CardResponse,
    CreateTransactionInput,
    MoonbeamTransactionResponse, TransactionsErrorType
} from "@moonbeam/moonbeam-models";
import { createTransaction } from "./resolvers/CreateTransactionResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createTransactionInput: CreateTransactionInput
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
 * @returns a {@link Promise} containing a {@link CardLinkResponse} or {@link CardResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<MoonbeamTransactionResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createTransaction":
            return await createTransaction(event.info.fieldName, event.arguments.createTransactionInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
            };
    }
}

