import {
    CreateReimbursementEligibilityInput,
    ReimbursementEligibilityResponse,
    ReimbursementsErrorType,
    UpdateReimbursementEligibilityInput
} from "@moonbeam/moonbeam-models";
import {createReimbursementEligibility} from "./resolvers/CreateReimbursementEligibilityResolver";
import {updateReimbursementEligibility} from "./resolvers/UpdateReimbursementEligibilityResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createReimbursementEligibilityInput: CreateReimbursementEligibilityInput,
        updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput
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
 * @returns a {@link Promise} containing a {@link ReimbursementEligibilityResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<ReimbursementEligibilityResponse> => {
    console.log(`Received new reimbursement eligibility event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createReimbursementEligibility":
            return await createReimbursementEligibility(event.info.fieldName, event.arguments.createReimbursementEligibilityInput);
        case "updateReimbursementEligibility":
            return await updateReimbursementEligibility(event.info.fieldName, event.arguments.updateReimbursementEligibilityInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.UnexpectedError
            };
    }
}

