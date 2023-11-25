import {AppsFlyerErrorType, AppsFlyerClient, AppsFlyerResponse, GetAppsFlyerCredentialsInput} from "@moonbeam/moonbeam-models";

/**
 * GetAppsFlyerCredentials resolver
 *
 * @param getAppsFlyerCredentialsInput the input needed to retrieve the appropriate API Key
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link AppsFlyerResponse}
 */
export const getAppsFlyerCredentials = async (fieldName: string, getAppsFlyerCredentialsInput: GetAppsFlyerCredentialsInput): Promise<AppsFlyerResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initialize a new Apps Flyer client, in order to retrieve the App Upgrade credentials
        const appUpgradeClient = new AppsFlyerClient(process.env.ENV_NAME!, region);

        // return the App Upgrade credentials
        return appUpgradeClient.getAppsFlyerAPIKey(getAppsFlyerCredentialsInput.osType);
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: AppsFlyerErrorType.UnexpectedError
        };
    }
}
