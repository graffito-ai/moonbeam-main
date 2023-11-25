import { AppsFlyerResponse, GetAppsFlyerCredentialsInput } from "@moonbeam/moonbeam-models";
/**
 * GetAppsFlyerCredentials resolver
 *
 * @param getAppsFlyerCredentialsInput the input needed to retrieve the appropriate API Key
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link AppsFlyerResponse}
 */
export declare const getAppsFlyerCredentials: (fieldName: string, getAppsFlyerCredentialsInput: GetAppsFlyerCredentialsInput) => Promise<AppsFlyerResponse>;
