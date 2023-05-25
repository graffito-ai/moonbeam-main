import { MilitaryVerificationStatusType } from "@moonbeam/moonbeam-models";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
/**
 * Class used as the base/generic client for all verification clients that
 * we will be connecting to.
 */
export declare abstract class VerificationClient {
    protected readonly secretsClient: SecretsManagerClient;
    protected readonly region: string;
    protected readonly environment: string;
    /**
     * Generic constructor for the verification client.
     *
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    protected constructor(region: string, environment: string);
    /**
     * Function used to retrieve an API Key and a base URL, used by a verification client, through the
     * Secrets Manager client.
     *
     * @param verificationClientSecretsName the name of the verification client's secrets pair
     *
     * @return a {@link Promise} of a {@link string} pair, containing the baseURL and apiKey to be used
     */
    protected retrieveServiceCredentials(verificationClientSecretsName: string): Promise<[string | null, string | null]>;
    /**
     * Function used to verify an individuals military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    abstract verify(): Promise<MilitaryVerificationStatusType>;
}
