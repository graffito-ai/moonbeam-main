import {ListReferralInput, ReferralErrorType, ReferralResponse} from "@moonbeam/moonbeam-models";
import { listReferrals } from "./resolvers/listReferrals";
import {getReferral} from "./resolvers/getReferral";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        id: string,
        filter: ListReferralInput
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
exports.handler = async (event: AppSyncEvent): Promise<ReferralResponse> => {
    console.log(`Received new referral event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getReferral":
            return await getReferral(event.arguments.id);
        case "listReferrals":
            return await listReferrals(event.arguments.filter);
        default:
            console.log(`Unexpected field name: {}`, event.info.fieldName);
            return {
                data: [],
                errorMessage: `Unexpected field name: ${event.info.fieldName}`,
                errorType: ReferralErrorType.UnexpectedError
            };
    }
}
