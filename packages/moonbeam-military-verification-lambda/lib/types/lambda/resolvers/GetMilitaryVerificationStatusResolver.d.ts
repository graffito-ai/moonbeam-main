import { GetMilitaryVerificationInput, MilitaryVerificationResponse } from "@moonbeam/moonbeam-models";
/**
 * GetMilitaryVerificationStatus resolver
 *
 * @param getMilitaryVerificationInput military verification input used for the verification status to be retrieved
 * @returns {@link Promise} of {@link MilitaryVerificationResponse}
 */
export declare const getMilitaryVerificationStatus: (getMilitaryVerificationInput: GetMilitaryVerificationInput) => Promise<MilitaryVerificationResponse>;
