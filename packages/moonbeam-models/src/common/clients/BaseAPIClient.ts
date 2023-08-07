import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";
import {Constants} from "../Constants";
import {
    Card,
    CardLinkResponse, CreateReimbursementEligibilityInput,
    CreateReimbursementInput,
    EligibleLinkedUser,
    EligibleLinkedUsersResponse, GetReimbursementByStatusInput,
    GetTransactionByStatusInput,
    MemberDetailsResponse,
    MemberResponse,
    MilitaryVerificationStatusType,
    MoonbeamTransaction,
    MoonbeamTransactionResponse,
    MoonbeamTransactionsByStatusResponse,
    MoonbeamUpdatedTransactionResponse, ReimbursementByStatusResponse, ReimbursementEligibilityResponse,
    ReimbursementResponse,
    RemoveCardResponse,
    Transaction,
    TransactionResponse, TransactionStatusResponse, UpdateReimbursementEligibilityInput,
    UpdateReimbursementInput,
    UpdateTransactionInput
} from "../GraphqlExports";
import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";

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
     * @param internalRestBased optional flag indicating whether the key is REST or GraphQL/AppSync based
     *                          in case of internal-used based keys
     *
     * @return a {@link Promise} of a {@link string} pair, containing the baseURL and apiKey to be used
     */
    protected async retrieveServiceCredentials(verificationClientSecretsName: string, internalRestBased?: boolean): Promise<[string | null, string | null, (string | null)?]> {
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
                    case Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME:
                        return internalRestBased !== undefined && internalRestBased
                            ? [clientPairAsJson[Constants.AWSPairConstants.MOONBEAM_INTERNAL_REST_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.MOONBEAM_INTERNAL_REST_API_KEY]]
                            : [clientPairAsJson[Constants.AWSPairConstants.MOONBEAM_INTERNAL_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.MOONBEAM_INTERNAL_API_KEY]]
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
     * Function used to create a reimbursement eligibility.
     *
     * @param createReimbursementEligibilityInput the reimbursement eligibility details to be passed in,
     * in order to create a new reimbursement eligibility
     *
     * @returns a {@link ReimbursementEligibilityResponse} representing the newly created reimbursement eligibility
     * data
     *
     * @protected
     */
    protected createReimbursementEligibility?(createReimbursementEligibilityInput: CreateReimbursementEligibilityInput): Promise<ReimbursementEligibilityResponse>;

    /**
     * Function used to update an existent reimbursement eligibility's details.
     *
     * @param updateReimbursementEligibilityInput the reimbursement eligibility details to be passed in,
     * in order to update an existing reimbursement eligibility
     *
     * @returns a {@link ReimbursementEligibilityResponse} representing the updated reimbursement eligibility
     * data
     *
     * @protected
     */
    protected updateReimbursementEligibility?(updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput): Promise<ReimbursementEligibilityResponse>;

    /**
     * Function used to get all transactions, for a particular user, filtered
     * by their status.
     *
     * @param getTransactionByStatusInput the transaction by status input object ot be passed in,
     * containing all the necessary filtering for retrieving the transactions.
     *
     * @returns a {@link MoonbeamTransactionsByStatusResponse} representing the transactional data,
     * filtered by status response
     *
     * @protected
     */
    protected getTransactionByStatus?(getTransactionByStatusInput: GetTransactionByStatusInput): Promise<MoonbeamTransactionsByStatusResponse>;

    /**
     * Function used to update an existing transaction's details.
     *
     * @param updateTransactionInput the transaction details to be passed in, in order to update
     * an existing transaction
     *
     * @returns a {@link MoonbeamUpdatedTransactionResponse} representing the updated transaction
     * data
     *
     * @protected
     */
    protected updateTransaction?(updateTransactionInput: UpdateTransactionInput): Promise<MoonbeamUpdatedTransactionResponse>;

    /**
     * Function used to get reimbursements for a particular user, filtered by their status.
     *
     * @param getReimbursementByStatusInput the reimbursement by status input, containing the filtering status
     *
     * @returns a {@link ReimbursementByStatusResponse} representing the matched reimbursement information, filtered by status
     *
     * @protected
     */
    protected getReimbursementByStatus?(getReimbursementByStatusInput: GetReimbursementByStatusInput): Promise<ReimbursementByStatusResponse>;

    /**
     * Function used to create a reimbursement internally, from an incoming trigger obtained from the
     * reimbursements trigger Lambda.
     *
     * @param createReimbursementInput the reimbursement input passed in from the cron Lambda trigger
     *
     * @returns a {@link ReimbursementResponse} representing the reimbursement details that were stored
     * in Dynamo DB
     *
     * @protected
     */
    protected createReimbursement?(createReimbursementInput: CreateReimbursementInput): Promise<ReimbursementResponse>;

    /**
     * Function used to update an existing reimbursement's details, from an incoming trigger obtained from the
     * reimbursements trigger Lambda.
     *
     * @param updateReimbursementInput the reimbursement input passed in from the cron Lambda trigger, to be used
     * while updating an existent reimbursement's details
     *
     * @returns a {@link ReimbursementResponse} representing the reimbursement details that were updated
     * in Dynamo DB
     *
     * @protected
     */
    protected updateReimbursement?(updateReimbursementInput: UpdateReimbursementInput): Promise<ReimbursementResponse>;

    /**
     * Function used to send a new reimbursement acknowledgment, for an eligible user with
     * a linked card, so we can kick-start the reimbursement process through the reimbursement
     * producer
     *
     * @param eligibleLinkedUser eligible linked user object to be passed in
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the reimbursement producer Lambda, to validate whether the reimbursement process was
     * kick-started or not
     *
     * @protected
     */
    protected reimbursementsAcknowledgment?(eligibleLinkedUser: EligibleLinkedUser): Promise<APIGatewayProxyResult>;

    /**
     * Function used to create a new transaction internally, from an incoming transaction
     * obtained from the SQS message/event
     *
     * @param transaction transaction passed in from the SQS message/event
     *
     * @return a {@link Promise} of {@link MoonbeamTransactionResponse} representing the transaction
     * details that were stored in Dynamo DB
     *
     * @protected
     */
    protected createTransaction?(transaction: MoonbeamTransaction): Promise<MoonbeamTransactionResponse>;

    /**
     * Function used to retrieve the list of eligible linked users, to be user during the reimbursements
     * process.
     *
     * @return a {link Promise} of {@link EligibleLinkedUsersResponse} representing the list of eligible
     * users
     *
     * @protected
     */
    protected getEligibleLinkedUsers?(): Promise<EligibleLinkedUsersResponse>;

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
     * @param userId unique user ID of a card linking user.
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used during the enrollment/linking process
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the linking call
     *
     * @protected
     */
    protected link?(userId: string, createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse>;

    /**
     * Function used to add a new card to an existing member.
     *
     * @param userId unique user ID of a card linking user.
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
    protected addCard?(userId: string, memberId: string, createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse>;

    /**
     * Function used to update a member's status, to either active or inactive.
     *
     * @param userId unique user ID of a card linking user.
     * @param memberId member id, retrieved from Olive, which the status will be updated for
     * @param memberFlag flag to indicate what the status of the member, will be updated to
     * @param updatedAt card linked object update date
     *
     * @return a {@link Promise} of {@link MemberResponse} representing the
     * member's contents after the update is performed
     *
     * @protected
     */
    protected updateMemberStatus?(userId: string, memberId: string, memberFlag: boolean, updatedAt: string): Promise<MemberResponse>;

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

    /**
     * Function used to retrieve the brand details, given a brand ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the transaction
     * with the brand details obtained, included in it.
     *
     * @protected
     */
    protected getBrandDetails?(transaction: Transaction): Promise<TransactionResponse>;

    /**
     * Function used to retrieve the store details, given a store ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the transaction
     * with the store details obtained, included in it.
     *
     * @protected
     */
    protected getStoreDetails?(transaction: Transaction): Promise<TransactionResponse>;

    /**
     * Function used to retrieve the member details, specifically the extMemberId, which is Moonbeam's unique user ID
     * set at creation time, given a member ID.
     *
     * @param memberId member ID obtained from Olive at creation time, used to retrieve the
     * other member details.
     *
     * @return a {@link Promise} of {@link MemberDetailsResponse} representing the member details
     *
     * @protected
     */
    protected getMemberDetails?(memberId: string): Promise<MemberDetailsResponse>;

    /**
     * Function used to retrieve the transaction details, given a transaction ID
     * (used for transactional purposes).
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this transaction details call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the
     * transaction object, populated with the additional transaction details that
     * we retrieved.
     *
     * @protected
     */
    protected getTransactionDetails?(transaction: Transaction): Promise<TransactionResponse>

    /**
     * Function used to retrieve the transaction status, given a transaction ID
     * (used for reimbursements purposes).
     *
     * @param transactionId the transaction id, to be passed in, in order to retrieve
     * the status necessary for reimbursement-related purposes.
     *
     * @return a {@link Promise} of {@link TransactionStatusResponse} representing the
     * transaction status object, populated with the transaction status that we retrieved.
     *
     * @protected
     */
    protected getTransactionStatus?(transactionId: string): Promise<TransactionStatusResponse>
}
