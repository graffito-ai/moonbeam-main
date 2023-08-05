import {
    CreateReimbursementInput,
    ReimbursementResponse,
    ReimbursementsErrorType,
    UpdateReimbursementInput
} from "@moonbeam/moonbeam-models";
import {createReimbursement} from "./resolvers/CreateReimbursementResolver";
import {updateReimbursement} from "./resolvers/UpdateReimbursementResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createReimbursementInput: CreateReimbursementInput,
        updateReimbursementInput: UpdateReimbursementInput
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
 * @returns a {@link Promise} containing a {@link ReimbursementResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<ReimbursementResponse> => {
    console.log(`Received new reimbursement event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createReimbursement":
            return await createReimbursement(event.info.fieldName, event.arguments.createReimbursementInput);
        case "updateReimbursement":
            return await updateReimbursement(event.info.fieldName, event.arguments.updateReimbursementInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.UnexpectedError
            };
    }
}

