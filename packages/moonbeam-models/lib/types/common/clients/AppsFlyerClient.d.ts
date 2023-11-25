import { BaseAPIClient } from "./BaseAPIClient";
import { AppsFlyerResponse, OsType } from "../GraphqlExports";
/**
 * Class used as the base/generic client for all AppsFlyerClient calls.
 */
export declare class AppsFlyerClient extends BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string);
    /**
     * Function used to get the API Key for the Apps Flyer service.
     *
     * @param osType the type of operating system installed on the device,
     * that will determine which API Key we will be returning.
     *
     * @returns a {@link AppsFlyerResponse}, representing the API Key
     * used for the Apps Flyer service.
     */
    getAppsFlyerAPIKey(osType: OsType): Promise<AppsFlyerResponse>;
}
