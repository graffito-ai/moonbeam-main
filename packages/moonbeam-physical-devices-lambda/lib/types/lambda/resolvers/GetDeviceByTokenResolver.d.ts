import { GetDeviceByTokenInput, UserDeviceResponse } from "@moonbeam/moonbeam-models";
/**
 * GetDeviceByToken resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDeviceByTokenInput device by token input used for the physical device
 * for a particular user, to be retrieved
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
export declare const getDeviceByToken: (fieldName: string, getDeviceByTokenInput: GetDeviceByTokenInput) => Promise<UserDeviceResponse>;
