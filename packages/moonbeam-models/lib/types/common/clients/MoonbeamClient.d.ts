import { BaseAPIClient } from "./BaseAPIClient";
import { CreateNotificationInput, CreateNotificationResponse, EligibleLinkedUsersResponse, EmailFromCognitoResponse, GetDevicesForUserInput, GetTransactionByStatusInput, GetTransactionInput, IneligibleLinkedUsersResponse, MilitaryVerificationNotificationUpdate, MoonbeamTransaction, MoonbeamTransactionResponse, MoonbeamTransactionsByStatusResponse, MoonbeamTransactionsResponse, MoonbeamUpdatedTransactionResponse, NotificationReminderResponse, UpdatedTransactionEvent, UpdateNotificationReminderInput, UpdateTransactionInput, UserDevicesResponse, UserForNotificationReminderResponse } from "../GraphqlExports";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";
/**
 * Class used as the base/generic client for all Moonbeam internal AppSync
 * and/or API Gateway APIs.
 */
export declare class MoonbeamClient extends BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string);
    /**
     * Function used to get all the users used to delivered
     * notification reminders to.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email.
     */
    getAllUsersForNotificationReminders(): Promise<UserForNotificationReminderResponse>;
    /**
     * Function used to get a user's email, given certain filters to be passed in.
     *
     * @param militaryVerificationNotificationUpdate the military verification notification update
     * objects, used to filter through the Cognito user pool, in order to obtain a user's email.
     *
     * @returns a {@link EmailFromCognitoResponse} representing the user's email obtained
     * from Cognito.
     */
    getEmailForUser(militaryVerificationNotificationUpdate: MilitaryVerificationNotificationUpdate): Promise<EmailFromCognitoResponse>;
    /**
     * Function used to send a new military verification status acknowledgment, so we can kick-start the military verification
     * status update notification process through the producer.
     *
     * @param militaryVerificationNotificationUpdate military verification update object
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the military verification update producer Lambda, to validate whether the military verification
     * notification update process kick-started or not
     */
    militaryVerificationUpdatesAcknowledgment(militaryVerificationNotificationUpdate: MilitaryVerificationNotificationUpdate): Promise<APIGatewayProxyResult>;
    /**
     * Function used to send a new transaction acknowledgment, for an updated transaction, so we can kick-start the
     * transaction process through the transaction producer.
     *
     * @param updatedTransactionEvent updated transaction event to be passed in
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the reimbursement producer Lambda, to validate whether the transactions process was
     * kick-started or not.
     */
    transactionsAcknowledgment(updatedTransactionEvent: UpdatedTransactionEvent): Promise<APIGatewayProxyResult>;
    /**
     * Function used to get all ACTIVE notification reminders.
     *
     * @returns a {@link NotificationReminderResponse}, representing the ACTIVE notification
     * reminders.
     */
    getNotificationReminders(): Promise<NotificationReminderResponse>;
    /**
     * Function used to update a specific notification reminder.
     *
     * @param updateNotificationReminderInput the notification reminder input, containing any information used to
     * update an applicable notification reminder.
     *
     * @returns a {@link NotificationReminderResponse}, representing the update notification reminder.
     *
     * @protected
     */
    updateNotificationReminder(updateNotificationReminderInput: UpdateNotificationReminderInput): Promise<NotificationReminderResponse>;
    /**
     * Function used to get the users with no linked cards.
     *
     * @returns a {@link IneligibleLinkedUsersResponse}, representing the users
     * which are not eligible for a reimbursement, since they have no linked cards.
     */
    getUsersWithNoCards(): Promise<IneligibleLinkedUsersResponse>;
    /**
     * Function used to retrieve the list of eligible linked users, to be user during the reimbursements
     * process.
     *
     * @return a {link Promise} of {@link EligibleLinkedUsersResponse} representing the list of eligible
     * users
     */
    getEligibleLinkedUsers(): Promise<EligibleLinkedUsersResponse>;
    /**
     * Function used to create a new transaction internally, from an incoming transaction
     * obtained from the SQS message/event
     *
     * @param transaction transaction passed in from the SQS message/event
     *
     * @return a {link Promise} of {@link MoonbeamTransactionResponse} representing the transaction
     * details that were stored in Dynamo DB
     */
    createTransaction(transaction: MoonbeamTransaction): Promise<MoonbeamTransactionResponse>;
    /**
     * Function used to get all transactions, for a particular user, filtered
     * by their status.
     *
     * @param getTransactionByStatusInput the transaction by status input object ot be passed in,
     * containing all the necessary filtering for retrieving the transactions.
     *
     * @returns a {@link MoonbeamTransactionsByStatusResponse} representing the transactional data,
     * filtered by status response
     */
    getTransactionByStatus(getTransactionByStatusInput: GetTransactionByStatusInput): Promise<MoonbeamTransactionsByStatusResponse>;
    /**
     * Function used to get all transactions, for a particular user.
     *
     * @param getTransactionInput the transaction input object to be passed in,
     * containing all the necessary filtering for retrieving the transactions for a particular user.
     *
     * @returns a {@link MoonbeamTransactionsResponse} representing the transactional data.
     */
    getTransaction(getTransactionInput: GetTransactionInput): Promise<MoonbeamTransactionsResponse>;
    /**
     * Function used to update an existing transaction's details.
     *
     * @param updateTransactionInput the transaction details to be passed in, in order to update
     * an existing transaction
     *
     * @returns a {@link MoonbeamUpdatedTransactionResponse} representing the update transaction's
     * data
     */
    updateTransaction(updateTransactionInput: UpdateTransactionInput): Promise<MoonbeamUpdatedTransactionResponse>;
    /**
     * Function used to create a notification.
     *
     * @param createNotificationInput the notification details to be passed in, in order to create a new
     * notification
     *
     * @returns a {@link CreateNotificationResponse} representing the newly created notification data
     */
    createNotification(createNotificationInput: CreateNotificationInput): Promise<CreateNotificationResponse>;
    /**
     * Function used to get all the physical devices associated with a particular user.
     *
     * @param getDevicesForUserInput the devices for user input, containing the filtering information
     * used to retrieve all the physical devices for a particular user.
     *
     * @returns a {@link UserDevicesResponse} representing the matched physical devices' information.
     */
    getDevicesForUser(getDevicesForUserInput: GetDevicesForUserInput): Promise<UserDevicesResponse>;
}
