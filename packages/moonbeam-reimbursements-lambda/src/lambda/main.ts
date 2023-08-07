import {
    CreateReimbursementInput,
    GetReimbursementByStatusInput,
    ReimbursementByStatusResponse,
    ReimbursementResponse,
    ReimbursementsErrorType,
    UpdateReimbursementInput
} from "@moonbeam/moonbeam-models";
import {createReimbursement} from "./resolvers/CreateReimbursementResolver";
import {updateReimbursement} from "./resolvers/UpdateReimbursementResolver";
import {getReimbursementByStatus} from "./resolvers/GetReimbursementByStatusResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createReimbursementInput: CreateReimbursementInput,
        updateReimbursementInput: UpdateReimbursementInput,
        getReimbursementByStatusInput: GetReimbursementByStatusInput
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
 * @returns a {@link Promise} containing a {@link ReimbursementResponse} or {@link ReimbursementByStatusResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<ReimbursementResponse | ReimbursementByStatusResponse> => {
    console.log(`Received new reimbursement event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createReimbursement":
            return await createReimbursement(event.info.fieldName, event.arguments.createReimbursementInput);
        case "updateReimbursement":
            return await updateReimbursement(event.info.fieldName, event.arguments.updateReimbursementInput);
        case "getReimbursementByStatus":
            return await getReimbursementByStatus(event.info.fieldName, event.arguments.getReimbursementByStatusInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.UnexpectedError
            };
    }
}

