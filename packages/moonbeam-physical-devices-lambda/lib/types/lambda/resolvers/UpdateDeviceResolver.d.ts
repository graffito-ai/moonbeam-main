import { UpdateDeviceInput, UserDeviceResponse } from "@moonbeam/moonbeam-models";
/**
 * UpdateDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateDeviceInput update device input, used to update an existent physical device
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
export declare const updateDevice: (fieldName: string, updateDeviceInput: UpdateDeviceInput) => Promise<UserDeviceResponse>;
