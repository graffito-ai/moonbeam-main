import { BaseAPIClient } from "./BaseAPIClient";
import { CreateNotificationInput, CreateNotificationResponse, CreateReimbursementEligibilityInput, CreateReimbursementInput, EligibleLinkedUser, EligibleLinkedUsersResponse, GetDevicesForUserInput, GetReimbursementByStatusInput, GetTransactionByStatusInput, GetTransactionInput, MoonbeamTransaction, MoonbeamTransactionResponse, MoonbeamTransactionsByStatusResponse, MoonbeamTransactionsResponse, MoonbeamUpdatedTransactionResponse, ReimbursementByStatusResponse, ReimbursementEligibilityResponse, ReimbursementResponse, UpdatedTransactionEvent, UpdateReimbursementEligibilityInput, UpdateReimbursementInput, UpdateTransactionInput, UserDevicesResponse } from "../GraphqlExports";
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
     * Function used to send a new reimbursement acknowledgment, for an eligible user with
     * a linked card, so we can kick-start the reimbursement process through the reimbursement
     * producer
     *
     * @param eligibleLinkedUser eligible linked user object to be passed in
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the reimbursement producer Lambda, to validate whether the reimbursement process was
     * kick-started or not
     */
    reimbursementsAcknowledgment(eligibleLinkedUser: EligibleLinkedUser): Promise<APIGatewayProxyResult>;
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
     * Function used to create a reimbursement internally, from an incoming trigger obtained from the
     * reimbursements trigger Lambda.
     *
     * @param createReimbursementInput the reimbursement input passed in from the cron Lambda trigger
     *
     * @returns a {@link ReimbursementResponse} representing the reimbursement details that were stored
     * in Dynamo DB
     */
    createReimbursement(createReimbursementInput: CreateReimbursementInput): Promise<ReimbursementResponse>;
    /**
     * Function used to update an existing reimbursement's details, from an incoming trigger obtained from the
     * reimbursements trigger Lambda.
     *
     * @param updateReimbursementInput the reimbursement input passed in from the cron Lambda trigger, to be used
     * while updating an existent reimbursement's details
     *
     * @returns a {@link ReimbursementResponse} representing the reimbursement details that were updated
     * in Dynamo DB
     */
    updateReimbursement(updateReimbursementInput: UpdateReimbursementInput): Promise<ReimbursementResponse>;
    /**
     * Function used to create a reimbursement eligibility.
     *
     * @param createReimbursementEligibilityInput the reimbursement eligibility details to be passed in,
     * in order to create a new reimbursement eligibility
     *
     * @returns a {@link ReimbursementEligibilityResponse} representing the newly created reimbursement eligibility
     * data
     */
    createReimbursementEligibility(createReimbursementEligibilityInput: CreateReimbursementEligibilityInput): Promise<ReimbursementEligibilityResponse>;
    /**
     * Function used to update an existent reimbursement eligibility's details.
     *
     * @param updateReimbursementEligibilityInput the reimbursement eligibility details to be passed in,
     * in order to update an existing reimbursement eligibility
     *
     * @returns a {@link ReimbursementEligibilityResponse} representing the updated reimbursement eligibility
     * data
     */
    updateReimbursementEligibility(updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput): Promise<ReimbursementEligibilityResponse>;
    /**
     * Function used to get reimbursements for a particular user, filtered by their status.
     *
     * @param getReimbursementByStatusInput the reimbursement by status input, containing the filtering status
     *
     * @returns a {@link ReimbursementByStatusResponse} representing the matched reimbursement information, filtered by status
     */
    getReimbursementByStatus(getReimbursementByStatusInput: GetReimbursementByStatusInput): Promise<ReimbursementByStatusResponse>;
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
