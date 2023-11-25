import {AppsFlyerErrorType, AppsFlyerResponse, GetAppsFlyerCredentialsInput} from "@moonbeam/moonbeam-models";
import {getAppsFlyerCredentials} from "./resolvers/GetAppsFlyerCredentialsResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getAppsFlyerCredentialsInput: GetAppsFlyerCredentialsInput
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
 * @returns a {@link Promise} containing a {@link AppsFlyerResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<AppsFlyerResponse> => {
    console.log(`Received new Apps Flyer event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getAppsFlyerCredentials":
            return await getAppsFlyerCredentials(event.info.fieldName, event.arguments.getAppsFlyerCredentialsInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: AppsFlyerErrorType.UnexpectedError
            };
    }
}

