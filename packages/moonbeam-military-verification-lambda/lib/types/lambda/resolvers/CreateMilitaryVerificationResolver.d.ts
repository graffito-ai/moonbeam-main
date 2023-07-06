import { CreateMilitaryVerificationInput, CreateMilitaryVerificationResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateMilitaryVerification resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createMilitaryVerificationInput military verification object to be created
 * @returns {@link Promise} of {@link CreateMilitaryVerificationResponse}
 */
export declare const createMilitaryVerification: (fieldName: string, createMilitaryVerificationInput: CreateMilitaryVerificationInput) => Promise<CreateMilitaryVerificationResponse>;
