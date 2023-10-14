import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";
import { Card, CardLinkResponse, CreateNotificationInput, CreateNotificationResponse, EligibleLinkedUsersResponse, EmailFromCognitoResponse, GetDevicesForUserInput, GetOffersInput, GetTransactionByStatusInput, GetTransactionInput, MemberDetailsResponse, MemberResponse, MilitaryVerificationNotificationUpdate, MilitaryVerificationStatusType, MoonbeamTransaction, MoonbeamTransactionResponse, MoonbeamTransactionsByStatusResponse, MoonbeamTransactionsResponse, MoonbeamUpdatedTransactionResponse, NotificationChannelType, NotificationResponse, NotificationType, OffersResponse, RemoveCardResponse, SendEmailNotificationInput, SendMobilePushNotificationInput, Transaction, TransactionResponse, UpdatedTransactionEvent, UpdatedTransactionEventResponse, UpdateTransactionInput, UserDevicesResponse, UserForNotificationReminderResponse } from "../GraphqlExports";
/**
 * Class used as the base/generic client for all API clients that
 * we will be connecting to.
 */
export declare abstract class BaseAPIClient {
    protected readonly secretsClient: SecretsManagerClient;
    protected readonly region: string;
    protected readonly environment: string;
    /**
     * Generic constructor for the API client.
     *
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    protected constructor(region: string, environment: string);
    /**
     * Function used to retrieve various service credentials, used by any API clients, through the
     * Secrets Manager client.
     *
     * @param verificationClientSecretsName the name of the API client's secrets pair
     * @param internalRestBased optional flag indicating whether the key is REST or GraphQL/AppSync based
     *                          in case of internal-used based keys
     * @param notificationType  optional type indicating the type of notification, for which we are retrieving
     *                          specific secret configuration for
     * @param includeLoyaltyPrograms optional type indicating whether to include the loyalty program secret keys,
     *                               used for Olive calls
     * @param cognitoClientAccess optional type indicating whether to include the cognito access credentials/keys,
     *                            used for internal-based calls
     * @param channelType optional type indicating the type of channel, for which we are retrieving specific secret
     *                    configuration for
     *
     * @return a {@link Promise} of a {@link string} pair, containing various secrets to be used
     */
    protected retrieveServiceCredentials(verificationClientSecretsName: string, internalRestBased?: boolean, notificationType?: NotificationType, includeLoyaltyPrograms?: boolean, cognitoClientAccess?: boolean, channelType?: NotificationChannelType): Promise<[string | null, string | null, (string | null)?, (string | null)?, (string | null)?, (string | null)?, (string | null)?, (string | null)?]>;
    /**
     * Function used to get all users' emails and custom user IDs from Cognito.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID and email attributes.
     *
     * @protected
     */
    protected getAllUsersForNotificationReminders?(): Promise<UserForNotificationReminderResponse>;
    /**
     * Function used to get a user's email, given certain filters to be passed in.
     *
     * @param militaryVerificationNotificationUpdate the military verification notification update
     * objects, used to filter through the Cognito user pool, in order to obtain a user's email.
     *
     * @returns a {@link EmailFromCognitoResponse} representing the user's email obtained
     * from Cognito.
     *
     * @protected
     */
    protected getEmailForUser?(militaryVerificationNotificationUpdate: MilitaryVerificationNotificationUpdate): Promise<EmailFromCognitoResponse>;
    /**
     * Function used to get all the offers, given certain filters to be passed in.
     *
     * @param getOffersInput the offers input, containing the filtering information
     * used to retrieve all the applicable/matching offers.
     *
     * @returns a {@link OffersResponse} representing the matched offers' information.
     *
     * @protected
     */
    protected getOffers?(getOffersInput: GetOffersInput): Promise<OffersResponse>;
    /**
     * Function used to get all the physical devices associated with a particular user.
     *
     * @param getDevicesForUserInput the devices for user input, containing the filtering information
     * used to retrieve all the physical devices for a particular user.
     *
     * @returns a {@link UserDevicesResponse} representing the matched physical devices' information.
     *
     * @protected
     */
    protected getDevicesForUser?(getDevicesForUserInput: GetDevicesForUserInput): Promise<UserDevicesResponse>;
    /**
     * Function used to send a mobile push notification.
     *
     * @param sendMobilePushNotificationInput the notification input details to be passed in, in order to send
     * a mobile push notification
     * @param notificationType the type of notification to send mobile push notifications for
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     *
     * @protected
     */
    protected sendMobilePushNotification?(sendMobilePushNotificationInput: SendMobilePushNotificationInput, notificationType: NotificationType): Promise<NotificationResponse>;
    /**
     * Function used to send an email notification.
     *
     * @param sendEmailNotificationInput the notification input details to be passed in, in order to send
     * an email notification
     * @param notificationType the type of notification to send email notifications for
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     *
     * @protected
     */
    protected sendEmailNotification?(sendEmailNotificationInput: SendEmailNotificationInput, notificationType: NotificationType): Promise<NotificationResponse>;
    /**
     * Function used to create a notification.
     *
     * @param createNotificationInput the notification details to be passed in, in order to create a new
     * notification
     *
     * @returns a {@link CreateNotificationResponse} representing the newly created notification data
     *
     * @protected
     */
    protected createNotification?(createNotificationInput: CreateNotificationInput): Promise<CreateNotificationResponse>;
    /**
     * Function used to get all transactions, for a particular user.
     *
     * @param getTransactionInput the transaction input object to be passed in,
     * containing all the necessary filtering for retrieving the transactions for a particular user.
     *
     * @returns a {@link MoonbeamTransactionsResponse} representing the transactional data.
     *
     * @protected
     */
    protected getTransaction?(getTransactionInput: GetTransactionInput): Promise<MoonbeamTransactionsResponse>;
    /**
     * Function used to get all transactions, for a particular user, filtered
     * by their status.
     *
     * @param getTransactionByStatusInput the transaction by status input object to be passed in,
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
     * Function used to send a new military verification status acknowledgment, so we can kick-start the military verification
     * status update notification process through the producer.
     *
     * @param militaryVerificationNotificationUpdate military verification update object
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the military verification update producer Lambda, to validate whether the military verification
     * notification update process kick-started or not
     *
     * @protected
     */
    protected militaryVerificationUpdatesAcknowledgment?(militaryVerificationNotificationUpdate: MilitaryVerificationNotificationUpdate): Promise<APIGatewayProxyResult>;
    /**
     * Function used to send a new transaction acknowledgment, for an updated transaction, so we can kick-start the
     * transaction process through the transaction producer.
     *
     * @param updatedTransactionEvent updated transaction event to be passed in
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the reimbursement producer Lambda, to validate whether the transactions process was
     * kick-started or not.
     *
     * @protected
     */
    protected transactionsAcknowledgment?(updatedTransactionEvent: UpdatedTransactionEvent): Promise<APIGatewayProxyResult>;
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
    protected getTransactionDetails?(transaction: Transaction): Promise<TransactionResponse>;
    /**
     * Function used to retrieve the transaction details, given a transaction ID (used for updated
     * transactional events purposes).
     *
     * @param updatedTransactionEvent the updated transaction event object, populated by the
     * initial details passed by Olive in the updated webhook call. This object will be used
     * to set even more information for it, obtained from this transaction details call.
     *
     * @return a {@link Promise} of {@link UpdatedTransactionEventResponse} representing the
     * updated transaction event object, populated with the additional transaction details
     * that we retrieved
     *
     * @protected
     */
    protected getUpdatedTransactionDetails?(updatedTransactionEvent: UpdatedTransactionEvent): Promise<UpdatedTransactionEventResponse>;
}
