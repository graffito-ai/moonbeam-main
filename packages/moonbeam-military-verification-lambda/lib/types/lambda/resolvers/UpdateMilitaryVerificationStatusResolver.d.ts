import { UpdateMilitaryVerificationInput, UpdateMilitaryVerificationResponse } from "@moonbeam/moonbeam-models";
/**
 * UpdateMilitaryVerificationStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateMilitaryVerificationInput military verification input, used to update an existent one
 * @returns {@link Promise} of {@link UpdateMilitaryVerificationResponse}
 */
export declare const updateMilitaryVerificationStatus: (fieldName: string, updateMilitaryVerificationInput: UpdateMilitaryVerificationInput) => Promise<UpdateMilitaryVerificationResponse>;
