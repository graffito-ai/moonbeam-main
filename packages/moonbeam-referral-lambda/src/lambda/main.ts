import {
    CreateReferralInput,
    GetReferralsByStatusInput,
    ReferralErrorType,
    ReferralResponse,
    UpdateReferralInput,
    UserFromReferralInput,
    UserFromReferralResponse
} from "@moonbeam/moonbeam-models";
import { createReferral } from "./resolvers/CreateReferralResolver";
import {getReferralsByStatus} from "./resolvers/GetReferralsByStatusResolver";
import {getUserFromReferral} from "./resolvers/GetUserFromReferralResolver";
import {updateReferral} from "./resolvers/UpdateReferralResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getReferralsByStatusInput: GetReferralsByStatusInput,
        userFromReferralInput: UserFromReferralInput,
        createReferralInput: CreateReferralInput,
        updateReferralInput: UpdateReferralInput
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
 * @returns a {@link Promise} containing a {@link ReferralResponse} or {@link UserFromReferralResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<ReferralResponse | UserFromReferralResponse> => {
    console.log(`Received new Referral event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getReferralsByStatus":
            return await getReferralsByStatus(event.info.fieldName, event.arguments.getReferralsByStatusInput);
        case "getUserFromReferral":
            return await getUserFromReferral(event.info.fieldName, event.arguments.userFromReferralInput);
        case "createReferral":
            return await createReferral(event.info.fieldName, event.arguments.createReferralInput);
        case "updateReferral":
            return await updateReferral(event.info.fieldName, event.arguments.updateReferralInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: ReferralErrorType.UnexpectedError
            };
    }
}

