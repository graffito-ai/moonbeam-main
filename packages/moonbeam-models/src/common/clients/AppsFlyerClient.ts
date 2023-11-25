import {BaseAPIClient} from "./BaseAPIClient";
import {AppsFlyerErrorType, AppsFlyerResponse, OsType} from "../GraphqlExports";
import {Constants} from "../Constants";

/**
 * Class used as the base/generic client for all AppsFlyerClient calls.
 */
export class AppsFlyerClient extends BaseAPIClient {

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
     * Function used to get the API Key for the Apps Flyer service.
     *
     * @param osType the type of operating system installed on the device,
     * that will determine which API Key we will be returning.
     *
     * @returns a {@link AppsFlyerResponse}, representing the API Key
     * used for the Apps Flyer service.
     */
    async getAppsFlyerAPIKey(osType: OsType): Promise<AppsFlyerResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getAppsFlyerAPIKey Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to get the API Key for Apps Flyer retrieval call through the client
            const [appsFlyerIOSAPIKey, appsFlyerAndroidAPIKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.APPS_FLYER_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (appsFlyerIOSAPIKey === null || appsFlyerIOSAPIKey.length === 0 ||
                appsFlyerAndroidAPIKey === null || appsFlyerAndroidAPIKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for App Upgrade API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: AppsFlyerErrorType.UnexpectedError
                };
            } else {
                return {
                    data: osType === OsType.IOs ? appsFlyerIOSAPIKey : appsFlyerAndroidAPIKey
                }
            }
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving the Apps Flyer API Key through the ${endpointInfo}, for OS ${osType}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: AppsFlyerErrorType.UnexpectedError
            };
        }
    }
}
