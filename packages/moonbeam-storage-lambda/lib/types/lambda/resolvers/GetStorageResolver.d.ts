import { GetStorageInput, StorageResponse } from "@moonbeam/moonbeam-models";
/**
 * GetStorage resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getStorageInput input, based on which the appropriate file is retrieved from storage, through
 * a CloudFront distribution
 *
 * @returns {@link Promise} of {@link StorageResponse}
 */
export declare const getStorage: (fieldName: string, getStorageInput: GetStorageInput) => Promise<StorageResponse>;
