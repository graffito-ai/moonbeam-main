import {AppUpgradeErrorType, AppUpgradeResponse, AppUpgradeClient} from "@moonbeam/moonbeam-models";

/**
 * GetAppUpgradeCredentials resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link AppUpgradeResponse}
 */
export const getAppUpgradeCredentials = async (fieldName: string): Promise<AppUpgradeResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initialize a new App Upgrade client, in order to retrieve the App Upgrade credentials
        const appUpgradeClient = new AppUpgradeClient(process.env.ENV_NAME!, region);

        // return the App Upgrade credentials
        return appUpgradeClient.getAppUpgradeAPIKey();
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: AppUpgradeErrorType.UnexpectedError
        };
    }
}
