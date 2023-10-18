/**
 * File used to define a namespace, to be used in laying out
 * all the constants used throughout.
 */
export declare namespace Constants {
    namespace AmplifyConstants {
        const AMPLIFY_ID: string;
        const REGION: string;
        const ATTRIBUTE_EMAIL: string;
        const ATTRIBUTE_NAME: string;
        const ATTRIBUTE_UPDATED_AT: string;
        const ATTRIBUTE_BIRTHDATE: string;
        const ATTRIBUTE_PHONE_NUMBER: string;
        const ATTRIBUTE_SMS: string;
        const ATTRIBUTE_REQUIRES_LOWERCASE: string;
        const ATTRIBUTE_REQUIRES_NUMBERS: string;
        const ATTRIBUTE_REQUIRES_SYMBOLS: string;
        const ATTRIBUTE_REQUIRES_UPPERCASE: string;
        const ATTRIBUTE_COGNITO_USER_POOLS: string;
        const COGNITO_IDENTITY_POOL_ID: string;
        const COGNITO_REGION: string;
        const USER_POOLS_ID: string;
        const USER_POOLS_WEB_CLIENT_ID: string;
        const OAUTH: string;
        const COGNITO_USERNAME_ATTRIBUTES: string;
        const COGNITO_SOCIAL_PROVIDERS: string;
        const COGNITO_SIGNUP_ATTRIBUTES: string;
        const COGNITO_MFA_CONFIGURATION: string;
        const COGNITO_MFA_TYPES: string;
        const COGNITO_PASSWORD_PROTECTION_SETTINGS: string;
        const COGNITO_VERIFICATION_MECHANISMS: string;
    }
    namespace StorageConstants {
        const MOONBEAM_MAIN_FILES_KEY_PAIR_ID: string;
        const MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION: string;
        const MOONBEAM_PUBLIC_FILES_BUCKET_NAME: string;
        const MOONBEAM_MAIN_FILES_BUCKET_NAME: string;
        const AWS_S3_BUCKET_REGION: string;
        const AWS_S3_BUCKET: string;
    }
    namespace AppSyncConstants {
        const APPSYNC_ENDPOINT: string;
        const APPSYNC_REGION: string;
        const APPSYNC_AUTH_TYPE: string;
    }
    namespace MoonbeamConstants {
        const AWS_LAMBDA_INITIALIZATION_TYPE = "AWS_LAMBDA_INITIALIZATION_TYPE";
        const AWS_LAMBDA_PROVISIONED_CONCURRENCY = "provisioned-concurrency";
        const USER_AUTH_SESSION_TABLE = "USER_AUTH_SESSION_TABLE";
        const FAQ_TABLE: string;
        const NOTIFICATION_REMINDER_TABLE: string;
        const MILITARY_VERIFICATION_TABLE: string;
        const PARTNER_MERCHANT_TABLE: string;
        const CARD_LINKING_TABLE: string;
        const CARD_LINKING_STATUS_GLOBAL_INDEX: string;
        const TRANSACTIONS_TABLE: string;
        const PHYSICAL_DEVICES_TABLE: string;
        const PHYSICAL_DEVICES_ID_GLOBAL_INDEX: string;
        const PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX: string;
        const NOTIFICATIONS_TABLE: string;
        const NOTIFICATIONS_CHANNEL_TYPE_LOCAL_INDEX: string;
        const NOTIFICATIONS_TYPE_LOCAL_INDEX: string;
        const NOTIFICATIONS_STATUS_LOCAL_INDEX: string;
        const NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN: string;
        const UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN: string;
        const TRANSACTIONS_PROCESSING_TOPIC_ARN: string;
        const MILITARY_VERIFICATION_NOTIFICATION_PROCESSING_TOPIC_ARN: string;
        const TRANSACTIONS_ID_GLOBAL_INDEX: string;
        const TRANSACTIONS_STATUS_LOCAL_INDEX: string;
        const ENV_NAME: string;
        const ACCOUNT_LINKS: string;
        const AWS_REGION: string;
        const NONE_OR_ABSENT: string;
    }
    namespace AWSPairConstants {
        const COURIER_INTERNAL_SECRET_NAME = "courier-internal-secret-pair";
        const COURIER_BASE_URL = "COURIER_BASE_URL";
        const COGNITO_USER_POOL_ID = "COGNITO_USER_POOL_ID";
        const CONGITO_CLI_ACCESS_KEY_ID = "CONGITO_CLI_ACCESS_KEY_ID";
        const COGNITO_CLI_SECRET_ACCESS_KEY = "COGNITO_CLI_SECRET_ACCESS_KEY";
        const EMAIL_CARD_LINKING_REMINDER_AUTH_TOKEN = "EMAIL_CARD_LINKING_REMINDER_AUTH_TOKEN";
        const EMAIL_CARD_LINKING_REMINDER_TEMPLATE_ID = "EMAIL_CARD_LINKING_REMINDER_TEMPLATE_ID";
        const PUSH_CARD_LINKING_REMINDER_AUTH_TOKEN = "PUSH_CARD_LINKING_REMINDER_AUTH_TOKEN";
        const PUSH_CARD_LINKING_REMINDER_TEMPLATE_ID = "PUSH_CARD_LINKING_REMINDER_TEMPLATE_ID";
        const EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN = "EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN";
        const EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID = "EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID";
        const EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN = "EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN";
        const EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID = "EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID";
        const PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN = "PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN";
        const PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID = "PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID";
        const PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN = "PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN";
        const PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID = "PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID";
        const NEW_QUALIFYING_OFFER_NOTIFICATION_AUTH_TOKEN = "NEW_QUALIFYING_OFFER_NOTIFICATION_AUTH_TOKEN";
        const NEW_QUALIFYING_OFFER_NOTIFICATION_TEMPLATE_ID = "NEW_QUALIFYING_OFFER_NOTIFICATION_TEMPLATE_ID";
        const NEW_USER_SIGNUP_NOTIFICATION_AUTH_TOKEN = "NEW_USER_SIGNUP_NOTIFICATION_AUTH_TOKEN";
        const NEW_USER_SIGNUP_NOTIFICATION_TEMPLATE_ID = "NEW_USER_SIGNUP_NOTIFICATION_TEMPLATE_ID";
        const MAIN_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME = "main-files-cloudfront-pair";
        const MOONBEAM_INTERNAL_SECRET_NAME = "moonbeam-internal-secret-pair";
        const MOONBEAM_INTERNAL_API_KEY = "MOONBEAM_INTERNAL_API_KEY";
        const MOONBEAM_INTERNAL_BASE_URL = "MOONBEAM_INTERNAL_BASE_URL";
        const MOONBEAM_INTERNAL_REST_BASE_URL = "MOONBEAM_INTERNAL_REST_BASE_URL";
        const MOONBEAM_INTERNAL_REST_API_KEY = "MOONBEAM_INTERNAL_REST_API_KEY";
        const QUANDIS_SECRET_NAME = "quandis-secret-pair";
        const QUANDIS_API_KEY = "QUANDIS-API-KEY";
        const QUANDIS_BASE_URL = "QUANDIS-BASE-URL";
        const LIGHTHOUSE_SECRET_NAME = "lighthouse-secret-pair";
        const LIGHTHOUSE_BASE_URL = "LIGHTHOUSE-BASE-URL";
        const LIGHTHOUSE_API_KEY = "LIGHTHOUSE-API-KEY";
        const OLIVE_SECRET_NAME = "olive-secret-pair";
        const OLIVE_BASE_URL = "OLIVE-BASE-URL";
        const OLIVE_PUBLIC_KEY = "OLIVE-PUBLIC-KEY";
        const OLIVE_PRIVATE_KEY = "OLIVE-PRIVATE-KEY";
        const OLIVE_WEBHOOK_KEY = "OLIVE-WEBHOOK-KEY";
        const OLIVE_MOONBEAM_DEFAULT_LOYALTY = "OLIVE-MOONBEAM-DEFAULT-LOYALTY";
        const OLIVE_MOONBEAM_ONLINE_LOYALTY = "OLIVE-MOONBEAM-ONLINE-LOYALTY";
        const OLIVE_MOONBEAM_FIDELIS_DEFAULT_LOYALTY = "OLIVE-MOONBEAM-FIDELIS-DEFAULT-LOYALTY";
        const OLIVE_MOONBEAM_PREMIER_ONLINE_LOYALTY = "OLIVE-MOONBEAM-PREMIER-ONLINE-LOYALTY";
        const OLIVE_MOONBEAM_PREMIER_NEARBY_LOYALTY = "OLIVE-MOONBEAM-PREMIER-NEARBY-LOYALTY";
    }
}
