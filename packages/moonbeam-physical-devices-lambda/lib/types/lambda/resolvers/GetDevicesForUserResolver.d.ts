import { GetDevicesForUserInput, UserDevicesResponse } from "@moonbeam/moonbeam-models";
/**
 * GetDevicesForUser resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDevicesForUserInput devices for user input used for the physical devices
 * for a particular user, to be retrieved
 * @returns {@link Promise} of {@link UserDevicesResponse}
 */
export declare const getDevicesForUser: (fieldName: string, getDevicesForUserInput: GetDevicesForUserInput) => Promise<UserDevicesResponse>;
