import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";
import { Constants } from "../Constants";
import {
    MemberResponse,
    CardLinkResponse,
    MilitaryVerificationStatusType,
    RemoveCardResponse,
    Card
} from "../GraphqlExports";

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
     *
     * @protected
     */
    protected verify?(): Promise<MilitaryVerificationStatusType>;

    /**
     * Function used to complete the linking of an individual's card on the platform.
     *
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used during the enrollment/linking process
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the linking call
     *
     * @protected
     */
    protected link?(createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse>;

    /**
     * Function used to add a new card to an existing member.
     *
     * @param memberId member id, retrieved from Olive, which the card will be added to
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used in adding a new card to a member
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the add card call
     *
     * @protected
     */
    protected addCard?(memberId: string, createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse>;

    /**
     * Function used to update a member's status, to either active or inactive.
     *
     * @param memberId member id, retrieved from Olive, which the status will be updated for
     * @param memberFlag flag to indicate what the status of the member, will be updated to
     * @param updatedAt card linked object update date
     *
     * @return a {@link Promise} of {@link MemberResponse} representing the
     * member's contents after the update is performed
     *
     * @protected
     */
    protected updateMemberStatus?(memberId: string, memberFlag: boolean, updatedAt: string): Promise<MemberResponse>;

    /**
     * Function used to remove/deactivate a card, given its ID.
     *
     * @param cardId the id of the card to be removed/deleted/deactivated
     *
     * @return a {@link Promise} of {@link RemoveCardResponse} representing the
     * card removal response.
     *
     * @protected
     */
    protected removeCard?(cardId: string): Promise<RemoveCardResponse>;
}
