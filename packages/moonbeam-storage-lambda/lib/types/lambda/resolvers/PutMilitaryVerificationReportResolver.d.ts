import { MilitaryVerificationReportResponse, PutMilitaryVerificationReportInput } from "@moonbeam/moonbeam-models";
/**
 * PutMilitaryVerificationReport resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param putMilitaryVerificationReportInput input, based on which the appropriate reporting
 * file is retrieved from storage, through S3.
 *
 * @returns {@link Promise} of {@link MilitaryVerificationReportResponse}
 */
export declare const putMilitaryVerificationReport: (fieldName: string, putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput) => Promise<MilitaryVerificationReportResponse>;
