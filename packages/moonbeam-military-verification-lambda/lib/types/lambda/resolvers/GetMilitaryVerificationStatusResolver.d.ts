import { GetMilitaryVerificationInput, GetMilitaryVerificationResponse } from "@moonbeam/moonbeam-models";
/**
 * GetMilitaryVerificationStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getMilitaryVerificationInput military verification input used for the verification status
 * to be retrieved
 *
 * @returns {@link Promise} of {@link GetMilitaryVerificationResponse}
 */
export declare const getMilitaryVerificationStatus: (fieldName: string, getMilitaryVerificationInput: GetMilitaryVerificationInput) => Promise<GetMilitaryVerificationResponse>;
