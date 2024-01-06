import { GetMilitaryVerificationInformationInput, MilitaryVerificationReportingInformationResponse } from "@moonbeam/moonbeam-models";
/**
 * GetMilitaryVerificationInformation resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getMilitaryVerificationInformationInput military verification information input used for the military verification
 * information to be retrieved
 *
 * @returns {@link Promise} of {@link MilitaryVerificationReportingInformationResponse}
 */
export declare const getMilitaryVerificationInformation: (fieldName: string, getMilitaryVerificationInformationInput: GetMilitaryVerificationInformationInput) => Promise<MilitaryVerificationReportingInformationResponse>;
