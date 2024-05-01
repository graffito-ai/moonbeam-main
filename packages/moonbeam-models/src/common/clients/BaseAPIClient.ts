import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";
import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {
    Constants
} from "../Constants";
import {
    AppUpgradeResponse,
    Card, CardDetailsResponse,
    CardLinkResponse, CreateBulkNotificationInput,
    CreateBulkNotificationResponse, CreateDailyEarningsSummaryInput, CreateEventSeriesInput,
    CreateNotificationInput,
    CreateNotificationResponse, CreatePlaidLinkingSessionInput,
    DailyEarningsSummaryResponse,
    EligibleLinkedUsersResponse,
    EmailFromCognitoResponse, EventSeriesResponse,
    GeocodeAsyncInput,
    GeocodeAsyncResponse,
    GetDevicesForUserInput, GetLocationPredictionsInput, GetLocationPredictionsResponse,
    GetMilitaryVerificationInformationInput, GetNotificationByTypeInput, GetNotificationByTypeResponse,
    GetOffersInput,
    GetReferralsByStatusInput, GetStorageInput,
    GetTransactionByStatusInput,
    GetTransactionInput, GetTransactionsInRangeInput,
    GetUserCardLinkingIdInput,
    GetUserCardLinkingIdResponse, GetUserNotificationAssetsInput, GetUsersByGeographicalLocationInput,
    IneligibleLinkedUsersResponse,
    IneligibleTransaction,
    IneligibleTransactionResponse,
    MemberDetailsResponse,
    MemberResponse,
    MilitaryVerificationNotificationUpdate,
    MilitaryVerificationReportingInformation,
    MilitaryVerificationReportingInformationResponse,
    MilitaryVerificationReportResponse,
    MilitaryVerificationStatusType,
    MoonbeamTransaction,
    MoonbeamTransactionResponse,
    MoonbeamTransactionsByStatusResponse,
    MoonbeamTransactionsResponse,
    MoonbeamUpdatedTransactionResponse,
    NotificationChannelType,
    NotificationReminderResponse,
    NotificationResponse,
    NotificationType,
    OfferIdResponse,
    OfferRedemptionTypeResponse,
    OffersResponse, PlaidLinkingSessionResponse,
    PutMilitaryVerificationReportInput,
    ReferralResponse, ReimbursementProcessingResponse,
    RemoveCardResponse,
    SearchOffersInput, SendBulkEmailNotificationInput, SendBulkMobilePushNotificationInput,
    SendEmailNotificationInput,
    SendMobilePushNotificationInput, StorageResponse,
    Transaction,
    TransactionResponse, UpdateCardInput,
    UpdatedTransactionEvent,
    UpdatedTransactionEventResponse,
    UpdateNotificationReminderInput,
    UpdateReferralInput,
    UpdateTransactionInput,
    UserDevicesResponse,
    UserForNotificationReminderResponse,
    UserNotificationAssetsResponse
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
    protected async retrieveServiceCredentials(verificationClientSecretsName: string, internalRestBased?: boolean,
                                               notificationType?: NotificationType, includeLoyaltyPrograms?: boolean,
                                               cognitoClientAccess?: boolean, channelType?: NotificationChannelType)
        : Promise<[string | null, string | null,
        (string | null)?,
        (string | null)?,
        (string | null)?,
        (string | null)?,
        (string | null)?,
        (string | null)?,
        (string | null)?,
        (string | null)?,
        (string | null)?
    ]> {
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
                        if (cognitoClientAccess !== undefined && cognitoClientAccess) {
                            return [clientPairAsJson[Constants.AWSPairConstants.CONGITO_CLI_ACCESS_KEY_ID], clientPairAsJson[Constants.AWSPairConstants.COGNITO_CLI_SECRET_ACCESS_KEY],
                                clientPairAsJson[Constants.AWSPairConstants.COGNITO_USER_POOL_ID]]
                        } else {
                            return internalRestBased !== undefined && internalRestBased
                                ? [clientPairAsJson[Constants.AWSPairConstants.MOONBEAM_INTERNAL_REST_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.MOONBEAM_INTERNAL_REST_API_KEY]]
                                : [clientPairAsJson[Constants.AWSPairConstants.MOONBEAM_INTERNAL_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.MOONBEAM_INTERNAL_API_KEY]];
                        }
                    case Constants.AWSPairConstants.APP_UPGRADE_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.APP_UPGRADE_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.APP_UPGRADE_API_KEY]];
                    case Constants.AWSPairConstants.GOOGLE_MAPS_APIS_INTERNAL_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.GOOGLE_MAPS_APIS_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.GOOGLE_MAPS_APIS_IOS_KEY],
                            clientPairAsJson[Constants.AWSPairConstants.GOOGLE_MAPS_APIS_ANDROID_KEY], clientPairAsJson[Constants.AWSPairConstants.GOOGLE_MAPS_ANDROID_SHA],
                            clientPairAsJson[Constants.AWSPairConstants.GOOGLE_MAPS_APIS_KEY]];
                    case Constants.AWSPairConstants.EVENTBRITE_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.EVENTBRITE_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.EVENTBRITE_API_KEY]];
                    case Constants.AWSPairConstants.PLAID_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.PLAID_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.PLAID_CLIENT_ID],
                            clientPairAsJson[Constants.AWSPairConstants.PLAID_SECRET_KEY]];
                    case Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME:
                        // return the appropriate secrets, depending on the type of notification passed in
                        if (!notificationType) {
                            console.log(`Invalid notification type to retrieve secrets in ${verificationClientSecretsName}`);
                            return [null, null];
                        } else {
                            switch (notificationType) {
                                case NotificationType.NewUserSignup:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.NEW_USER_SIGNUP_NOTIFICATION_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.NEW_USER_SIGNUP_NOTIFICATION_TEMPLATE_ID]];
                                case NotificationType.NewQualifyingOfferAvailable:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.NEW_QUALIFYING_OFFER_NOTIFICATION_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.NEW_QUALIFYING_OFFER_NOTIFICATION_TEMPLATE_ID]];
                                case NotificationType.IneligibleTransaction:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_NEW_INELIGIBLE_TRANSACTION_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_NEW_INELIGIBLE_TRANSACTION_TEMPLATE_ID]];
                                case NotificationType.DailyEarningsSummary:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_DAILY_EARNINGS_SUMMARY_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_DAILY_EARNINGS_SUMMARY_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_DAILY_EARNINGS_SUMMARY_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_DAILY_EARNINGS_SUMMARY_TEMPLATE_ID]]
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_DAILY_EARNINGS_SUMMARY_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_DAILY_EARNINGS_SUMMARY_TEMPLATE_ID]];
                                    }
                                case NotificationType.LocationBasedOfferReminder:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_LOCATION_BASED_UPDATE_NOTIFICATION_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_LOCATION_BASED_UPDATE_NOTIFICATION_TEMPLATE_ID]];
                                case NotificationType.MilitaryStatusChangedPendingToRejected:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID]]
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID]];
                                    }
                                case NotificationType.MilitaryStatusChangedPendingToVerified:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID]];
                                    }
                                case NotificationType.CardLinkingReminder:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_CARD_LINKING_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_CARD_LINKING_REMINDER_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_CARD_LINKING_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_CARD_LINKING_REMINDER_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_CARD_LINKING_REMINDER_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_CARD_LINKING_REMINDER_TEMPLATE_ID]];
                                    }
                                case NotificationType.NewMapFeatureReminder:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID]];
                                    }
                                case NotificationType.VeteransDayTemplate_1Reminder:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_1_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_1_TEMPLATE_ID]];
                                case NotificationType.VeteransDayTemplate_2Reminder:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_2_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_2_TEMPLATE_ID]];
                                case NotificationType.VeteransDayTemplate_3Reminder:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID]];
                                    }
                                case NotificationType.ReferralTemplateLaunch:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID]];
                                    }
                                case NotificationType.ReferralTemplate_1Reminder:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_1_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_1_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_REFERRAL_TEMPLATE_1_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_REFERRAL_TEMPLATE_1_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_1_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_1_TEMPLATE_ID]];
                                    }
                                case NotificationType.MultipleCardFeatureReminder:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_MULTIPLE_CARDS_FEATURE_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_MULTIPLE_CARDS_FEATURE_REMINDER_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_MULTIPLE_CARDS_FEATURE_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_MULTIPLE_CARDS_FEATURE_REMINDER_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_MULTIPLE_CARDS_FEATURE_REMINDER_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_MULTIPLE_CARDS_FEATURE_REMINDER_TEMPLATE_ID]];
                                    }
                                case NotificationType.SanAntonioReferralTemplate_1Reminder:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER_TEMPLATE_ID]];
                                    }
                                case NotificationType.RoundupsWaitlistTemplate_1Reminder:
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_ROUNDUPS_WAITLIST_TEMPLATE_1_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_ROUNDUPS_WAITLIST_TEMPLATE_1_REMINDER_TEMPLATE_ID]];
                                case NotificationType.ReimbursementsReminder:
                                    if (channelType !== undefined) {
                                        return channelType === NotificationChannelType.Email
                                            ? [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_REIMBURSEMENTS_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.EMAIL_REIMBURSEMENTS_REMINDER_TEMPLATE_ID]]
                                            : [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_REIMBURSEMENTS_REMINDER_AUTH_TOKEN],
                                                clientPairAsJson[Constants.AWSPairConstants.PUSH_REIMBURSEMENTS_REMINDER_TEMPLATE_ID]];
                                    } else {
                                        return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_REIMBURSEMENTS_REMINDER_AUTH_TOKEN],
                                            clientPairAsJson[Constants.AWSPairConstants.EMAIL_REIMBURSEMENTS_REMINDER_TEMPLATE_ID]];
                                    }
                                case NotificationType.SpendingTemplate_1Reminder:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_SPENDING_REMINDER_TEMPLATE_1_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.PUSH_SPENDING_REMINDER_TEMPLATE_1_TEMPLATE_ID]];
                                case NotificationType.SpouseFeatureReminder:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.SPOUSE_FEATURE_REMINDER_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.SPOUSE_FEATURE_REMINDER_TEMPLATE_ID]];
                                case NotificationType.FeedbackTemplate_1Reminder:
                                    return [clientPairAsJson[Constants.AWSPairConstants.COURIER_BASE_URL],
                                        clientPairAsJson[Constants.AWSPairConstants.FEEDBACK_TEMPLATE_1_REMINDER_AUTH_TOKEN],
                                        clientPairAsJson[Constants.AWSPairConstants.FEEDBACK_TEMPLATE_1_REMINDER_TEMPLATE_ID]];
                                default:
                                    console.log(`Unknown notifications type to retrieve secrets in ${verificationClientSecretsName}`);
                                    return [null, null];
                            }
                        }
                    case Constants.AWSPairConstants.QUANDIS_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.QUANDIS_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.QUANDIS_API_KEY]];
                    case Constants.AWSPairConstants.LIGHTHOUSE_SECRET_NAME:
                        return [clientPairAsJson[Constants.AWSPairConstants.LIGHTHOUSE_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.LIGHTHOUSE_API_KEY]];
                    case Constants.AWSPairConstants.OLIVE_SECRET_NAME:
                        return includeLoyaltyPrograms !== undefined
                            ? [
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_BASE_URL],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_PUBLIC_KEY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_PRIVATE_KEY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_MOONBEAM_DEFAULT_LOYALTY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_MOONBEAM_FIDELIS_DEFAULT_LOYALTY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_MOONBEAM_ONLINE_LOYALTY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_MOONBEAM_PREMIER_ONLINE_LOYALTY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_MOONBEAM_PREMIER_NEARBY_LOYALTY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_MOONBEAM_VETERANS_DAY_LOYALTY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_MOONBEAM_CLICK_LOYALTY],
                                clientPairAsJson[Constants.AWSPairConstants.OLIVE_MOONBEAM_PREMIER_CLICK_LOYALTY]
                            ]
                            : [clientPairAsJson[Constants.AWSPairConstants.OLIVE_BASE_URL], clientPairAsJson[Constants.AWSPairConstants.OLIVE_PUBLIC_KEY], clientPairAsJson[Constants.AWSPairConstants.OLIVE_PRIVATE_KEY]];
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
     * Function used to get the notifications by their type, sorted by a particular date/time.
     *
     * @param getNotificationByTypeInput input passed in, which will be used in retrieving the notifications
     * by type appropriately.
     *
     * @returns a {@link GetNotificationByTypeResponse}, representing the filtered notifications, if any applicable.
     *
     * @protected
     */
    protected getNotificationByType?(getNotificationByTypeInput: GetNotificationByTypeInput): Promise<GetNotificationByTypeResponse>;

    /**
     * Function used to get the notification assets for a particular user.
     *
     * @param getUserNotificationAssetsInput input passed in, which will be used in retrieving the notifications
     * assets for the user accordingly.
     *
     * @returns a {@link UserNotificationAssetsResponse}, representing the retrieved notification assets, if any applicable.
     *
     * @protected
     */
    protected getUserNotificationAssets?(getUserNotificationAssetsInput: GetUserNotificationAssetsInput): Promise<UserNotificationAssetsResponse>;

    /**
     * Function used to create a new event series for a particular organization, by extracting
     * the appropriate events information from EventBrite.
     *
     * @param createEventSeriesInput input passed in, which will be used in creating a new event series
     * and implicitly filling in the appropriate missing information via the EventBrite API call.
     *
     * @returns a {@link EventSeriesResponse}, representing the newly created event series to be stored,
     * obtained from the EventBrite API call, alongside with the information passed in.
     *
     * @protected
     */
    protected createEventSeriesForOrganization?(createEventSeriesInput: CreateEventSeriesInput): Promise<EventSeriesResponse>;

    /**
     * Function used to retrieve a file's URL from storage via CloudFront and S3.
     *
     * @param getStorageInput input passed in, which will be used in returning the appropriate
     * URL for a given file.
     *
     * @returns a  {@link StorageResponse}, representing the retrieved chose file's URL.
     *
     * @protected
     */
    protected getStorageFileUrl?(getStorageInput: GetStorageInput): Promise<StorageResponse>;

    /**
     * Function used to retrieve location predictions, for a location to be passed in.
     *
     * @param getLocationPredictionsInput input passed in, which will be used in returning
     * location predictions
     *
     * @returns a {@link GetLocationPredictionsResponse}, representing the retrieved location predictions
     * to be returned.
     *
     * @protected
     */
    protected getLocationPredictions?(getLocationPredictionsInput: GetLocationPredictionsInput): Promise<GetLocationPredictionsResponse>;

    /**
     * Function used to geocode a particular address, for a location to be passed in.
     *
     * @param geocodeAsyncInput input passed in,
     * which we will retrieve the geocoded information for.
     *
     * @returns a {@link GeocodeAsyncResponse}, representing the passed in address's
     * geocoded information.
     *
     * @protected
     */
    protected geoCodeAsync?(geocodeAsyncInput: GeocodeAsyncInput): Promise<GeocodeAsyncResponse>;

    /**
     * Function used to get the military verification information of one
     * or multiple users, depending on the filters passed in.
     *
     * @param getMilitaryVerificationInformationInput the input containing the military
     * verification relevant filtering.
     *
     * @returns a {@link MilitaryVerificationReportingInformationResponse}, representing the filtered
     * military verification information records.
     *
     * @protected
     */
    protected getMilitaryVerificationInformation?(getMilitaryVerificationInformationInput: GetMilitaryVerificationInformationInput): Promise<MilitaryVerificationReportingInformationResponse>;

    /**
     * Function used to get create and initiate a Plaid linking session,
     *
     * @param createPlaidLinkingSessionInput the input containing the information
     * necessary to initiate a Plaid linking session.
     *
     * @returns a {@link PlaidLinkingSessionResponse}, representing the initiated
     * Plaid linking session
     *
     * @protected
     */
    protected createPlaidLinkingSession?(createPlaidLinkingSessionInput: CreatePlaidLinkingSessionInput): Promise<PlaidLinkingSessionResponse>;

    /**
     * Function used to update and/or create an existing/new military verification report
     * file.
     *
     * @param putMilitaryVerificationReportInput the input containing the information that needs to be
     * transferred into the military verification report file.
     *
     * @returns a {@link MilitaryVerificationReportResponse}, representing a flag highlighting whether
     * the file was successfully updated or not.
     *
     * @protected
     */
    protected putMilitaryVerificationReport?(putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput): Promise<MilitaryVerificationReportResponse>;

    /**
     * Function used to update a referral's particular information.
     *
     * @param updateReferralInput the input containing any information relevant in
     * updating an existing referral object
     *
     * @returns a {@link ReferralResponse}, representing the updated referral information.
     *
     * @protected
     */
    protected updateReferral?(updateReferralInput: UpdateReferralInput): Promise<ReferralResponse>;

    /**
     * Function used to get existing referrals filtered by a particular status.
     *
     * @param getReferralsByStatusInput the input containing any filtering information
     * pertaining the referral status that we would use to filter existing referrals by.
     *
     * @returns a {@link ReferralResponse}, representing the referral information filtered
     * by status.
     *
     * @protected
     */
    protected getReferralByStatus?(getReferralsByStatusInput: GetReferralsByStatusInput): Promise<ReferralResponse>;

    /**
     * Function used to get the API Key for the App Upgrade service.
     *
     * @returns a {@link AppUpgradeResponse}, representing the API Key
     * used for the App Upgrade service.
     *
     * @protected
     */
    protected getAppUpgradeAPIKey?(): Promise<AppUpgradeResponse>;

    /**
     * Function used to get the users with no linked cards.
     *
     * @returns a {@link IneligibleLinkedUsersResponse}, representing the users
     * which are not eligible for a reimbursement, since they have no linked cards.
     *
     * @protected
     */
    protected getUsersWithNoCards?(): Promise<IneligibleLinkedUsersResponse>;

    /**
     * Function used to get all ACTIVE notification reminders.
     *
     * @returns a {@link NotificationReminderResponse}, representing the ACTIVE notification
     * reminders.
     *
     * @protected
     */
    protected getNotificationReminders?(): Promise<NotificationReminderResponse>;

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
    protected updateNotificationReminder?(updateNotificationReminderInput: UpdateNotificationReminderInput): Promise<NotificationReminderResponse>;

    /**
     * Function used to get a user's contact information, based on certain
     * filters.
     *
     * @param contactInformationInput contact information input passed in, containing the
     * filters used to retrieve the user's contact information.
     *
     * @returns a {@link MilitaryVerificationReportingInformationResponse}, representing the user's filtered
     * contact information.
     *
     * @protected
     */
    protected retrieveContactInformationForUser?(contactInformationInput: MilitaryVerificationReportingInformation): Promise<MilitaryVerificationReportingInformationResponse>;

    /**
     * Function used to get all the users eligible for a reimbursement.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email.
     *
     * @protected
     */
    protected getAllUsersEligibleForReimbursements?(): Promise<UserForNotificationReminderResponse>;

    /**
     * Function used to get all the users ineligible for a reimbursement.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email.
     *
     * @protected
     */
    protected getAllUsersIneligibleForReimbursements?(): Promise<UserForNotificationReminderResponse>;

    /**
     * Function used to get all the users used to delivered
     * notification reminders to.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email.
     *
     * @protected
     */
    protected getAllUsersForNotificationReminders?(): Promise<UserForNotificationReminderResponse>;

    /**
     * Function used to get all the users used to deliver notification reminders to,
     * sorted by a particular location.
     *
     * @param getUsersByGeographicalLocationInput the geolocation input that we filter users by
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email, sorted by a particular location (city & state combination).
     *
     * @protected
     */
    protected getUsersByGeographyForNotificationReminders?(getUsersByGeographicalLocationInput :GetUsersByGeographicalLocationInput): Promise<UserForNotificationReminderResponse>;

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
     * Function used to get a user's email, given their custom user:id.
     *
     * @param userId the user id to be passed in, used to retrieve someone's email
     *
     * @returns a {@link EmailFromCognitoResponse} representing the user's email obtained
     * from Cognito.
     *
     * @protected
     */
    protected getEmailByUserId?(userId: String): Promise<EmailFromCognitoResponse>;

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
     * Function used to search an offer, given certain filters to be passed in.
     *
     * @param searchOffersInput the offers input, containing the filtering information
     * used to search any applicable/matching offers.
     *
     * @returns a {@link OffersResponse} representing the matched offers' information.
     *
     * @protected
     */
    protected searchOffers?(searchOffersInput: SearchOffersInput): Promise<OffersResponse>;

    /**
     * Function used to get all devices which have a linked push token.
     *
     * @returns a {@link UserDevicesResponse} representing the matched physical devices' information.
     *
     * @protected
     */
    protected getAllDevices?(): Promise<UserDevicesResponse>;

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
     * Function used to send a bulk mobile push notification.
     *
     * @param sendBulkMobilePushNotificationInput the notification input details to be passed in, in order to send
     * a bulk mobile push notification
     * @param notificationType the type of notification to send email notifications for
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     *
     * @protected
     */
    protected sendBulkMobilePushNotification?(sendBulkMobilePushNotificationInput: SendBulkMobilePushNotificationInput, notificationType: NotificationType): Promise<NotificationResponse>;

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
     * Function used to send a bulk email notification.
     *
     * @param sendBulkEmailNotificationInput the notification input details to be passed in, in order to send
     * an email notification
     * @param notificationType the type of notification to send email notifications for
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     *
     * @protected
     */
    protected sendBulkEmailNotification?(sendBulkEmailNotificationInput: SendBulkEmailNotificationInput, notificationType: NotificationType): Promise<NotificationResponse>;

    /**
     * Function used to create daily earning summaries for all applicable users, who spent
     * in a particular day.
     *
     * @param createDailyEarningsSummaryInput the daily earnings summary input to be passed in, in order to
     * create all applicable daily earning summaries.
     *
     * @returns a {@link DailyEarningsSummaryResponse} {@link Promise}, representing the newly created daily summaries,
     * for all applicable users.
     *
     * @protected
     */
    protected createDailyEarningsSummary?(createDailyEarningsSummaryInput: CreateDailyEarningsSummaryInput): Promise<DailyEarningsSummaryResponse>;

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
     * Function used to create a bulk notification.
     *
     * @param createBulkNotificationInput the bulk notification details to be passed in, in order to create a new
     * bulk notification
     *
     * @returns a {@link CreateBulkNotificationResponse} representing the newly created bulk notification data
     *
     * @protected
     */
    protected createBulkNotification?(createBulkNotificationInput: CreateBulkNotificationInput): Promise<CreateBulkNotificationResponse>;

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
     * Function used to get all transactions, in a particular time range.
     *
     * @param getTransactionsInRangeInput the transaction in range input object to be passed in,
     * containing all the necessary filtering for retrieving the transactions in a particular time range.
     *
     * @returns a {@link MoonbeamTransactionsResponse} representing the transactional data.
     *
     * @protected
     */
    protected getTransactionsInRange?(getTransactionsInRangeInput: GetTransactionsInRangeInput): Promise<MoonbeamTransactionsResponse>;

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
     * Function used to retrieve the details of a given card, given its corresponding id.
     *
     * @param cardId the id of the card to retrieve the details for
     *
     * @return a {link Promise} of {@link CardDetailsResponse} representing the expiration date of
     * the card to be retrieved.
     *
     * @protected
     */
    protected getCardDetails?(cardId: string): Promise<CardDetailsResponse>;

    /**
     * Function used to retrieve the update the details of a given card. This will especially be used
     * when updating its expiration date.
     *
     * @return a {link Promise} of {@link EligibleLinkedUsersResponse} representing the user with the
     * updated card details.
     *
     * @protected
     */
    protected updateCardDetails?(updateCardInput: UpdateCardInput): Promise<EligibleLinkedUsersResponse>;

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
     * Function used to verify an individual's military service status.
     *
     * @param numberOfCalls optional param, used for use cases when we recursively call
     *                      this function in order to make additional calls to Quandis
     *                      for users who list an incorrect enlistment year at first
     *                      (not applicable for the VA)
     * @param newEnlistmentYear optional param, representing new enlistment year for the
     *                          recursive call (not applicable for the VA).
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     *
     * @protected
     */
    protected verifyServiceMember?(numberOfCalls?: number, newEnlistmentYear?: number): Promise<MilitaryVerificationStatusType>;

    /**
     * Function used to verify an individual's spouse's military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     *
     * @protected
     */
    protected verifyMemberSpouse?(): Promise<MilitaryVerificationStatusType>;

    /**
     * Function used to initiate a Plaid Hosted Linking Session.
     *
     * @param createPlaidLinkingSessionInput create Plaid linking session input, used to
     * create a Plaid Linking Hosted session.
     *
     * @return a {@link Promise} of {@link PlaidLinkingSessionResponse} representing the
     * Plaid linking session response object obtained from the linking session call
     *
     * @protected
     */
    protected createPlaidLinkSession?(createPlaidLinkingSessionInput: CreatePlaidLinkingSessionInput): Promise<PlaidLinkingSessionResponse>;

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
     * Function used to retrieve the brand details, given a brand ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link IneligibleTransactionResponse} representing the transaction
     * with the brand details obtained, included in it.
     *
     * @protected
     */
    protected getBrandDetailsForIneligible?(transaction: IneligibleTransaction): Promise<IneligibleTransactionResponse>;

    /**
     * Function used to retrieve the store details, given a store ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link IneligibleTransactionResponse} representing the transaction
     * with the store details obtained, included in it.
     *
     * @protected
     */
    protected getStoreDetailsForIneligible?(transaction: IneligibleTransaction): Promise<IneligibleTransactionResponse>;

    /**
     * Function used to retrieve the store details, given a store ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} or {@link IneligibleTransactionResponse} representing the transaction
     * with the store details obtained, included in it.
     *
     * @protected
     */
    protected getStoreDetails?(transaction: Transaction ): Promise<TransactionResponse>;

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
     * @return a {@link Promise} of {@link IneligibleTransactionResponse} representing the
     * transaction object, populated with the additional transaction details that we retrieved.
     *
     * @protected
     */
    protected getTransactionDetailsForIneligible?(transaction: IneligibleTransaction): Promise<IneligibleTransactionResponse>;

    /**
     * Function used to retrieve the transaction details, given a transaction ID
     * (used for transactional purposes).
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this transaction details call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the
     * transaction object, populated with the additional transaction details that we retrieved.
     *
     * @protected
     */
    protected getTransactionDetails?(transaction: Transaction): Promise<TransactionResponse>;

    /**
     * Function used to update a transaction by specifying the amount distributed to the member
     * during a cash-out/reimbursement, given its transaction ID.
     * (used for reimbursements/cash-out purposes).
     *
     * @param transactionId the id of the transaction to be updated
     * @param distributedToMemberAmount the amount distributed to the member during the cash-out/reimbursement
     *
     * @return a {@link Promise} of {@link ReimbursementProcessingResponse} representing a
     * flag indicating whether the reimbursement process can continue or not.
     *
     * @protected
     */
    protected updateTransactionStatus?(transactionId: string, distributedToMemberAmount: number): Promise<ReimbursementProcessingResponse>;

    /**
     * Function used to retrieve the offer id, obtained from a transaction object, given
     * a transaction identifier (used for transactional purposes).
     *
     * @param transactionId the id of the transaction, used to retrieve the offer id
     * from.
     *
     * @return a {@link Promise} of {@link OfferIdResponse} representing the offer id
     * and/or the redeemed offer id, obtained from the transaction details.
     *
     * @protected
     */
    protected getOfferId?(transactionId: string): Promise<OfferIdResponse>;

    /**
     * Function used to retrieve the type of offer redemption, obtained from the offer object.
     *
     * @param offerId the id of the offer, used to retrieve the type of redemption for.
     *
     * @return a {@link Promise} of {@link OfferRedemptionTypeResponse} representing the redemption
     * type, obtained from the offer object.
     *
     * @protected
     */
    protected getOfferRedemptionType?(offerId: string): Promise<OfferRedemptionTypeResponse>;

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

    /**
     * Function used to retrieve a user's card linking ID, given their Moonbeam
     * internal unique ID.
     *
     * @param getUserCardLinkingIdInput the input object containing the unique Moonbeam
     * internal ID, to be used while retrieving the user's card linking ID.
     *
     * @return a {@link Promise} of {@link GetUserCardLinkingIdResponse} representing the response
     * object, containing the user's card linking id.
     *
     * @protected
     */
    protected getUserCardLinkingId?(getUserCardLinkingIdInput: GetUserCardLinkingIdInput): Promise<GetUserCardLinkingIdResponse>;
}
