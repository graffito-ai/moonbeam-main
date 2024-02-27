import {
    CreateReimbursementInput,
    GetReimbursementsInput,
    ReimbursementResponse,
    ReimbursementsErrorType
} from "@moonbeam/moonbeam-models";
import { createReimbursement } from "./resolvers/CreateReimbursementsResolver";
import { getReimbursements } from "./resolvers/GetReimbursementsResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createReimbursementInput: CreateReimbursementInput,
        getReimbursementsInput: GetReimbursementsInput
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
    console.log(`Received new reimbursements event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createReimbursement":
            return await createReimbursement(event.info.fieldName, event.arguments.createReimbursementInput);
        case "getReimbursements":
            return await getReimbursements(event.info.fieldName, event.arguments.getReimbursementsInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.UnexpectedError
            };
    }
}

