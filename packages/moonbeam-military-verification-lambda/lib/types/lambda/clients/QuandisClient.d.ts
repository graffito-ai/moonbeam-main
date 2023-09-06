import { BaseAPIClient, MilitaryVerificationInformation, MilitaryVerificationStatusType } from "@moonbeam/moonbeam-models";
/**
 * Class used as the base/generic client for all Quandis verification calls.
 */
export declare class QuandisClient extends BaseAPIClient {
    /**
     * The verification information provided by the customer, which they will
     * get verified upon.
     */
    private readonly verificationInformation;
    /**
     * Generic constructor for the verification client.
     *
     * @param verificationInformation verification information provided by the
     * customer.
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    constructor(verificationInformation: MilitaryVerificationInformation, environment: string, region: string);
    /**
     * Function used to verify an individuals military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    verify(): Promise<MilitaryVerificationStatusType>;
}
