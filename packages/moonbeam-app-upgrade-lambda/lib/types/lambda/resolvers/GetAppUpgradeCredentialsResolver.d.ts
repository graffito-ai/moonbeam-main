import { AppUpgradeResponse } from "@moonbeam/moonbeam-models";
/**
 * GetAppUpgradeCredentials resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link AppUpgradeResponse}
 */
export declare const getAppUpgradeCredentials: (fieldName: string) => Promise<AppUpgradeResponse>;
