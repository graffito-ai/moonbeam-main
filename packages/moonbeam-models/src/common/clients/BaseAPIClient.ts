import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";
import { Constants } from "../Constants";
import {CardLinkResponse, MilitaryVerificationStatusType} from "../GraphqlExports";

/**
 * Class used as the base/generic client for all API clients that
 * we will be connecting to.
 */
export abstract class BaseAPIClient {
    // The Secrets Manager client, to be used while retrieving secrets related to clients.
    protected readonly secretsClient: SecretsManagerClient;

    // The AWS region that the API client will be initialized in
    protected readonly region: string;

    // The AWS environment that the API client will be initialized in
    protected readonly environment: string;

    /**
     * Generic constructor for the API client.
     *
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    protected constructor(region: string, environment: string) {
        this.region = region;
        this.environment = environment;

        this.secretsClient = new SecretsManagerClient({region: region});
    }

    /**
     * Function used to retrieve an API Key and a base URL, used by a API client, through the
     * Secrets Manager client.
     *
     * @param verificationClientSecretsName the name of the API client's secrets pair
     *
     * @return a {@link Promise} of a {@link string} pair, containing the baseURL and apiKey to be used
     */
    protected async retrieveServiceCredentials(verificationClientSecretsName: string): Promise<[string | null, string | null, (string | null)?]> {
        try {
            // retrieve the secrets pair for the API client, depending on the current environment and region
            const verificationClientAPIPair = await this.secretsClient
                .send(new GetSecretValueCommand(({SecretId: `${verificationClientSecretsName}-${this.environment}-${this.region}`})));

            // check if the secrets for the API Client exist
            if (verificationClientAPIPair.SecretString) {
                // convert the retrieved secrets pair value, as a JSON object
                const clientPairAsJson = JSON.parse(verificationClientAPIPair.SecretString!);

                // filter out and set the necessary API Client API credentials, depending on the client secret name passed in
                switch (verificationClientSecretsName) {
                    case Constants.AWSPairConstants.QUANDIS_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.QUANDIS_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.QUANDIS_API_KEY]];
                    case Constants.AWSPairConstants.LIGHTHOUSE_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.LIGHTHOUSE_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.LIGHTHOUSE_API_KEY]];
                    case Constants.AWSPairConstants.OLIVE_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.OLIVE_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.OLIVE_PUBLIC_KEY], clientPairAsJson[Constants.AWSPairConstants.OLIVE_PRIVATE_KEY]];
                    default:
                        console.log(`Unknown API client secrets name passed in ${verificationClientSecretsName}`);
                        return [null, null];
                }
            } else {
                console.log(`API client secrets pair not available for ${verificationClientSecretsName}, ${verificationClientAPIPair}`);

                return [null, null];
            }
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving an API Key ${err}`;
            console.log(errorMessage);

            throw new Error(errorMessage);
        }
    }

    /**
     * Function used to verify an individuals military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    protected verify?(): Promise<MilitaryVerificationStatusType>;

    /**
     * Function used to complete the linking of an individual's card on the platform.
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * military verification status obtained from the client verification call
     */
    protected link?(): Promise<CardLinkResponse>;
}
