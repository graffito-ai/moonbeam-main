import {BaseAPIClient} from "./BaseAPIClient";
import {AppUpgradeErrorType, AppUpgradeResponse} from "../GraphqlExports";
import {Constants} from "../Constants";

/**
 * Class used as the base/generic client for all AppUpgradeClient calls.
 */
export class AppUpgradeClient extends BaseAPIClient {

    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string) {
        super(region, environment);
    }

    /**
     * Function used to get the API Key for the App Upgrade service.
     *
     * @returns a {@link AppUpgradeResponse}, representing the API Key
     * used for the App Upgrade service.
     *
     */
    async getAppUpgradeAPIKey(): Promise<AppUpgradeResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getAppUpgradeAPIKey Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to get the API Key for App Upgrade retrieval call through the client
            const [appUpgradeBaseURL, appUpgradeAPIKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.APP_UPGRADE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (appUpgradeBaseURL === null || appUpgradeBaseURL.length === 0 ||
                appUpgradeAPIKey === null || appUpgradeAPIKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for App Upgrade API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: AppUpgradeErrorType.UnexpectedError
                };
            } else {
                return {
                    data: appUpgradeAPIKey
                }
            }
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving the App Upgrade API Key through the ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: AppUpgradeErrorType.UnexpectedError
            };
        }
    }
}
