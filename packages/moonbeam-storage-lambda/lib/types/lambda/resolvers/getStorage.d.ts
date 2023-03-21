import { GetStorageInput, StorageResponse } from "@moonbeam/moonbeam-models";
/**
 * GetStorage resolver
 *
 * @param getStorageInput input, based on which the appropriate file is retrieved from storage, through
 * a CloudFront distribution
 *
 * @returns {@link Promise} of {@link StorageResponse}
 */
export declare const getStorage: (getStorageInput: GetStorageInput) => Promise<StorageResponse>;
