import { BaseAPIClient } from "./BaseAPIClient";
import { AppUpgradeResponse } from "../GraphqlExports";
/**
 * Class used as the base/generic client for all AppUpgradeClient calls.
 */
export declare class AppUpgradeClient extends BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string);
    /**
     * Function used to get the API Key for the App Upgrade service.
     *
     * @returns a {@link AppUpgradeResponse}, representing the API Key
     * used for the App Upgrade service.
     *
     */
    getAppUpgradeAPIKey(): Promise<AppUpgradeResponse>;
}
