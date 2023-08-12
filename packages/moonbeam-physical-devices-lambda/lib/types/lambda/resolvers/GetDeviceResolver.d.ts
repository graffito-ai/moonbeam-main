import { GetDeviceInput, UserDeviceResponse } from "@moonbeam/moonbeam-models";
/**
 * GetDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDeviceInput device input used for the physical device object to be retrieved
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
export declare const getDevice: (fieldName: string, getDeviceInput: GetDeviceInput) => Promise<UserDeviceResponse>;
