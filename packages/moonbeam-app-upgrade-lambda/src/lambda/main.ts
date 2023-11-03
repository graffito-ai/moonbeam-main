import {AppUpgradeErrorType, AppUpgradeResponse} from "@moonbeam/moonbeam-models";
import { getAppUpgradeCredentials } from "./resolvers/GetAppUpgradeCredentialsResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {},
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
 * @returns a {@link Promise} containing a {@link AppUpgradeResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<AppUpgradeResponse> => {
    console.log(`Received new App Upgrade event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getAppUpgradeCredentials":
            return await getAppUpgradeCredentials(event.info.fieldName);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: AppUpgradeErrorType.UnexpectedError
            };
    }
}

