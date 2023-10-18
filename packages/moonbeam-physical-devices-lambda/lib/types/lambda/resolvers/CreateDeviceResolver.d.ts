import { CreateDeviceInput, UserDeviceResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createDeviceInput create device input object, used to create a physical device.
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
export declare const createDevice: (fieldName: string, createDeviceInput: CreateDeviceInput) => Promise<UserDeviceResponse>;
