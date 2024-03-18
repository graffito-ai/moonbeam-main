/**
 * File used to define a namespace, to be used in laying out
 * all the constants used throughout.
 */
export namespace Constants {
    // Amplify constants used in mapping the CDK outputs to the AWS exports Amplify file
    export namespace AmplifyConstants {
        // General related
        export const AMPLIFY_ID:string = 'amplify_app_id';
        export const REGION: string = 'aws_project_region';

        // Attribute related
        export const ATTRIBUTE_EMAIL: string = 'EMAIL';
        export const ATTRIBUTE_NAME: string = 'NAME';
        export const ATTRIBUTE_UPDATED_AT: string = 'UPDATED_AT';
        export const ATTRIBUTE_BIRTHDATE: string = 'BIRTHDATE';
        export const ATTRIBUTE_PHONE_NUMBER: string = 'PHONE_NUMBER';
        export const ATTRIBUTE_SMS: string = 'SMS';
        export const ATTRIBUTE_REQUIRES_LOWERCASE: string = 'REQUIRES_LOWERCASE';
        export const ATTRIBUTE_REQUIRES_NUMBERS: string = 'REQUIRES_NUMBERS';
        export const ATTRIBUTE_REQUIRES_SYMBOLS: string = 'REQUIRES_SYMBOLS';
        export const ATTRIBUTE_REQUIRES_UPPERCASE: string = 'REQUIRES_UPPERCASE';
        export const ATTRIBUTE_COGNITO_USER_POOLS: string = 'AMAZON_COGNITO_USER_POOLS';

        // Cognito related
        export const COGNITO_IDENTITY_POOL_ID: string = 'aws_cognito_identity_pool_id';
        export const COGNITO_REGION: string = 'aws_cognito_region';
        export const USER_POOLS_ID: string = 'aws_user_pools_id';
        export const USER_POOLS_WEB_CLIENT_ID: string = 'aws_user_pools_web_client_id';
        export const OAUTH: string = 'oauth';
        export const COGNITO_USERNAME_ATTRIBUTES: string = 'aws_cognito_username_attributes';
        export const COGNITO_SOCIAL_PROVIDERS: string = 'aws_cognito_social_providers';
        export const COGNITO_SIGNUP_ATTRIBUTES: string = 'aws_cognito_signup_attributes';
        export const COGNITO_MFA_CONFIGURATION: string = 'aws_cognito_mfa_configuration';
        export const COGNITO_MFA_TYPES: string = 'aws_cognito_mfa_types';
        export const COGNITO_PASSWORD_PROTECTION_SETTINGS: string = 'aws_cognito_password_protection_settings';
        export const COGNITO_VERIFICATION_MECHANISMS: string = 'aws_cognito_verification_mechanisms';
    }
    // Storage related constants
    export namespace StorageConstants {
        export const MOONBEAM_PUBLIC_FILES_BUCKET_NAME: string = 'moonbeam-public-files-bucket';
        export const MOONBEAM_MILITARY_VERIFICATION_REPORTING_BUCKET_NAME: string = 'moonbeam-military-verification-reporting-bucket';

        export const MOONBEAM_MAIN_FILES_KEY_PAIR_ID: string = 'MOONBEAM_MAIN_FILES_KEY_PAIR_ID';
        export const MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION: string = 'MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION';
        export const MOONBEAM_MAIN_FILES_BUCKET_NAME: string = 'moonbeam-files-bucket';

        export const MOONBEAM_LOGO_FILES_KEY_PAIR_ID: string = 'MOONBEAM_LOGO_FILES_KEY_PAIR_ID';
        export const MOONBEAM_LOGO_FILES_CLOUDFRONT_DISTRIBUTION: string = 'MOONBEAM_LOGO_FILES_CLOUDFRONT_DISTRIBUTION';
        export const MOONBEAM_LOGO_FILES_BUCKET_NAME: string = 'moonbeam-logo-files-bucket';

        export const AWS_S3_BUCKET_REGION: string = 'aws_user_files_s3_bucket_region';
        export const AWS_S3_BUCKET: string = 'aws_user_files_s3_bucket';
    }
    // AppSync constants used in mapping the AppSync CDK outputs to the AWS exports Amplify file
    export namespace AppSyncConstants {
        export const APPSYNC_ENDPOINT: string = 'aws_appsync_graphqlEndpoint';
        export const APPSYNC_REGION: string = 'aws_appsync_region';
        export const APPSYNC_AUTH_TYPE: string = 'aws_appsync_authenticationType';
    }
    // Moonbeam specific constants used in mapping various resources
    export namespace MoonbeamConstants {
        // Infrastructure related
        export const MOONBEAM_FRONTEND_LOG_GROUP_NAME = 'MOONBEAM_FRONTEND_LOG_GROUP_NAME';
        export const AWS_LAMBDA_INITIALIZATION_TYPE = 'AWS_LAMBDA_INITIALIZATION_TYPE';
        export const AWS_LAMBDA_PROVISIONED_CONCURRENCY = 'provisioned-concurrency';
        export const USER_AUTH_SESSION_TABLE = 'USER_AUTH_SESSION_TABLE';
        export const APP_REVIEW_TABLE: string = 'APP_REVIEW_TABLE';
        export const FAQ_TABLE: string = 'FAQ_TABLE';
        export const NOTIFICATION_REMINDER_TABLE: string = 'NOTIFICATION_REMINDER_TABLE';
        export const MILITARY_VERIFICATION_TABLE: string = 'MILITARY_VERIFICATION_TABLE';
        export const PARTNER_MERCHANT_TABLE: string = 'PARTNER_MERCHANT_TABLE';
        export const CARD_LINKING_TABLE: string = 'CARD_LINKING_TABLE';
        export const CARD_LINKING_STATUS_GLOBAL_INDEX: string = 'CARD_LINKING_STATUS_GLOBAL_INDEX';
        export const REFERRAL_TABLE: string = 'REFERRAL_TABLE';
        export const REFERRAL_STATUS_GLOBAL_INDEX: string = 'REFERRAL_STATUS_GLOBAL_INDEX';
        export const TRANSACTIONS_TABLE: string = 'TRANSACTIONS_TABLE';
        export const REIMBURSEMENTS_TABLE: string = 'REIMBURSEMENTS_TABLE';
        export const PHYSICAL_DEVICES_TABLE: string = 'PHYSICAL_DEVICES_TABLE';
        export const PHYSICAL_DEVICES_ID_GLOBAL_INDEX: string = 'PHYSICAL_DEVICES_ID_GLOBAL_INDEX';
        export const PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX: string = 'PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX';
        export const NOTIFICATIONS_TABLE: string = 'NOTIFICATIONS_TABLE';
        export const NOTIFICATIONS_CHANNEL_TYPE_LOCAL_INDEX: string = 'NOTIFICATIONS_CHANNEL_TYPE_LOCAL_INDEX';
        export const NOTIFICATIONS_TYPE_LOCAL_INDEX: string = 'NOTIFICATIONS_TYPE_LOCAL_INDEX';
        export const NOTIFICATIONS_STATUS_LOCAL_INDEX: string = 'NOTIFICATIONS_STATUS_LOCAL_INDEX';
        export const NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN: string = 'NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN';
        export const UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN: string = 'UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN';
        export const REFERRAL_PROCESSING_TOPIC_ARN: string = 'REFERRAL_PROCESSING_TOPIC_ARN';
        export const TRANSACTIONS_PROCESSING_TOPIC_ARN: string = 'TRANSACTIONS_PROCESSING_TOPIC_ARN';
        export const MILITARY_VERIFICATION_NOTIFICATION_PROCESSING_TOPIC_ARN: string = 'MILITARY_VERIFICATION_NOTIFICATION_PROCESSING_TOPIC_ARN';
        export const MILITARY_VERIFICATION_REPORTING_PROCESSING_TOPIC_ARN: string = 'MILITARY_VERIFICATION_REPORTING_PROCESSING_TOPIC_ARN';
        export const TRANSACTIONS_ID_GLOBAL_INDEX: string = 'TRANSACTIONS_ID_GLOBAL_INDEX';
        export const TRANSACTIONS_STATUS_LOCAL_INDEX: string = 'TRANSACTIONS_STATUS_LOCAL_INDEX';
        export const REIMBURSEMENTS_ID_GLOBAL_INDEX: string = 'REIMBURSEMENTS_ID_GLOBAL_INDEX';
        export const REIMBURSEMENTS_STATUS_LOCAL_INDEX: string = 'REIMBURSEMENTS_STATUS_LOCAL_INDEX';
        export const MILITARY_VERIFICATION_STATUS_GLOBAL_INDEX: string = 'MILITARY_VERIFICATION_STATUS_GLOBAL_INDEX';
        export const SERVICES_PARTNERS_TABLE: string = 'SERVICES_PARTNERS_TABLE';
        export const SERVICES_PARTNERS_CREATE_TIME_GLOBAL_INDEX: string = 'SERVICES_PARTNERS_CREATE_TIME_GLOBAL_INDEX';
        export const EVENT_SERIES_TABLE: string = 'EVENT_SERIES_TABLE';
        export const EVENT_SERIES_CREATE_TIME_GLOBAL_INDEX: string = 'EVENT_SERIES_CREATE_TIME_GLOBAL_INDEX';
        export const ENV_NAME: string = 'ENV_NAME';
        export const ACCOUNT_LINKS: string = 'ACCOUNT_LINKS';
        export const AWS_REGION: string = 'AWS_REGION';
        // General related
        export const NONE_OR_ABSENT: string = 'N/A';
    }
    // AWS Secrets Manager (pair-based constants)
    export namespace AWSPairConstants {
        export const GOOGLE_MAPS_APIS_INTERNAL_SECRET_NAME = `google-maps-internal-secret-pair`;
        export const GOOGLE_MAPS_APIS_BASE_URL = `GOOGLE_MAPS_APIS_BASE_URL`;
        export const GOOGLE_MAPS_APIS_KEY = `GOOGLE_MAPS_APIS_KEY`;
        export const GOOGLE_MAPS_APIS_IOS_KEY = `GOOGLE_MAPS_APIS_IOS_KEY`;
        export const GOOGLE_MAPS_APIS_ANDROID_KEY = `GOOGLE_MAPS_APIS_ANDROID_KEY`;
        export const GOOGLE_MAPS_ANDROID_SHA = `GOOGLE_MAPS_ANDROID_SHA`;

        export const COURIER_INTERNAL_SECRET_NAME = `courier-internal-secret-pair`;
        export const COURIER_BASE_URL = `COURIER_BASE_URL`;

        export const COGNITO_USER_POOL_ID = `COGNITO_USER_POOL_ID`;
        export const CONGITO_CLI_ACCESS_KEY_ID = `CONGITO_CLI_ACCESS_KEY_ID`;
        export const COGNITO_CLI_SECRET_ACCESS_KEY = `COGNITO_CLI_SECRET_ACCESS_KEY`;

        export const SPOUSE_FEATURE_REMINDER_AUTH_TOKEN = `SPOUSE_FEATURE_REMINDER_AUTH_TOKEN`;
        export const SPOUSE_FEATURE_REMINDER_TEMPLATE_ID = `SPOUSE_FEATURE_REMINDER_TEMPLATE_ID`;

        export const FEEDBACK_TEMPLATE_1_REMINDER_AUTH_TOKEN = `FEEDBACK_TEMPLATE_1_REMINDER_AUTH_TOKEN`;
        export const FEEDBACK_TEMPLATE_1_REMINDER_TEMPLATE_ID = `FEEDBACK_TEMPLATE_1_REMINDER_TEMPLATE_ID`;

        export const EMAIL_MULTIPLE_CARDS_FEATURE_REMINDER_AUTH_TOKEN = `EMAIL_MULTIPLE_CARDS_FEATURE_REMINDER_AUTH_TOKEN`;
        export const EMAIL_MULTIPLE_CARDS_FEATURE_REMINDER_TEMPLATE_ID = `EMAIL_MULTIPLE_CARDS_FEATURE_REMINDER_TEMPLATE_ID`;
        export const PUSH_MULTIPLE_CARDS_FEATURE_REMINDER_AUTH_TOKEN = `PUSH_MULTIPLE_CARDS_FEATURE_REMINDER_AUTH_TOKEN`;
        export const PUSH_MULTIPLE_CARDS_FEATURE_REMINDER_TEMPLATE_ID = `PUSH_MULTIPLE_CARDS_FEATURE_REMINDER_TEMPLATE_ID`;

        export const PUSH_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN = `PUSH_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN`;
        export const PUSH_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID = `PUSH_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID`;
        export const EMAIL_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN = `EMAIL_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN`;
        export const EMAIL_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID = `EMAIL_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID`;
        export const PUSH_REFERRAL_TEMPLATE_1_AUTH_TOKEN = `PUSH_REFERRAL_TEMPLATE_1_AUTH_TOKEN`;
        export const PUSH_REFERRAL_TEMPLATE_1_TEMPLATE_ID = `PUSH_REFERRAL_TEMPLATE_1_TEMPLATE_ID`;
        export const EMAIL_REFERRAL_TEMPLATE_1_AUTH_TOKEN = `EMAIL_REFERRAL_TEMPLATE_1_AUTH_TOKEN`;
        export const EMAIL_REFERRAL_TEMPLATE_1_TEMPLATE_ID = `EMAIL_REFERRAL_TEMPLATE_1_TEMPLATE_ID`;

        export const PUSH_VETERANS_DAY_TEMPLATE_1_AUTH_TOKEN = `PUSH_VETERANS_DAY_TEMPLATE_1_AUTH_TOKEN`;
        export const PUSH_VETERANS_DAY_TEMPLATE_1_TEMPLATE_ID = `PUSH_VETERANS_DAY_TEMPLATE_1_TEMPLATE_ID`;
        export const PUSH_VETERANS_DAY_TEMPLATE_2_AUTH_TOKEN = `PUSH_VETERANS_DAY_TEMPLATE_2_AUTH_TOKEN`;
        export const PUSH_VETERANS_DAY_TEMPLATE_2_TEMPLATE_ID = `PUSH_VETERANS_DAY_TEMPLATE_2_TEMPLATE_ID`;

        export const EMAIL_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN = `EMAIL_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN`;
        export const EMAIL_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID = `EMAIL_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID`;
        export const PUSH_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN = `PUSH_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN`;
        export const PUSH_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID = `PUSH_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID`;

        export const EMAIL_CARD_LINKING_REMINDER_AUTH_TOKEN = `EMAIL_CARD_LINKING_REMINDER_AUTH_TOKEN`;
        export const EMAIL_CARD_LINKING_REMINDER_TEMPLATE_ID = `EMAIL_CARD_LINKING_REMINDER_TEMPLATE_ID`;
        export const PUSH_CARD_LINKING_REMINDER_AUTH_TOKEN = `PUSH_CARD_LINKING_REMINDER_AUTH_TOKEN`;
        export const PUSH_CARD_LINKING_REMINDER_TEMPLATE_ID = `PUSH_CARD_LINKING_REMINDER_TEMPLATE_ID`;

        export const EMAIL_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN = `EMAIL_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN`;
        export const EMAIL_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID = `EMAIL_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID`;
        export const PUSH_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN = `PUSH_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN`;
        export const PUSH_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID = `PUSH_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID`;

        export const EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN = `EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN`;
        export const EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID = `EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID`;
        export const EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN = `EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN`;
        export const EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID = `EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID`;
        export const PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN = `PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN`;
        export const PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID = `PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID`;
        export const PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN = `PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN`;
        export const PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID = `PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID`;

        export const NEW_QUALIFYING_OFFER_NOTIFICATION_AUTH_TOKEN = `NEW_QUALIFYING_OFFER_NOTIFICATION_AUTH_TOKEN`;
        export const NEW_QUALIFYING_OFFER_NOTIFICATION_TEMPLATE_ID = `NEW_QUALIFYING_OFFER_NOTIFICATION_TEMPLATE_ID`;
        export const NEW_USER_SIGNUP_NOTIFICATION_AUTH_TOKEN = `NEW_USER_SIGNUP_NOTIFICATION_AUTH_TOKEN`;
        export const NEW_USER_SIGNUP_NOTIFICATION_TEMPLATE_ID = `NEW_USER_SIGNUP_NOTIFICATION_TEMPLATE_ID`;

        export const MAIN_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME = `main-files-cloudfront-pair`;
        export const LOGO_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME = `logo-files-cloudfront-pair`;
        export const MOONBEAM_INTERNAL_SECRET_NAME = `moonbeam-internal-secret-pair`;
        export const MOONBEAM_INTERNAL_API_KEY = `MOONBEAM_INTERNAL_API_KEY`;
        export const MOONBEAM_INTERNAL_BASE_URL = `MOONBEAM_INTERNAL_BASE_URL`;
        export const MOONBEAM_INTERNAL_REST_BASE_URL = `MOONBEAM_INTERNAL_REST_BASE_URL`;
        export const MOONBEAM_INTERNAL_REST_API_KEY = `MOONBEAM_INTERNAL_REST_API_KEY`;

        export const EVENTBRITE_SECRET_NAME = `eventbrite-secret-pair`;
        export const EVENTBRITE_API_KEY = `EVENTBRITE-API-KEY`;
        export const EVENTBRITE_BASE_URL = `EVENTBRITE-BASE-URL`;

        export const QUANDIS_SECRET_NAME = `quandis-secret-pair`;
        export const QUANDIS_API_KEY = `QUANDIS-API-KEY`;
        export const QUANDIS_BASE_URL = `QUANDIS-BASE-URL`;

        export const LIGHTHOUSE_SECRET_NAME = `lighthouse-secret-pair`;
        export const LIGHTHOUSE_BASE_URL = `LIGHTHOUSE-BASE-URL`;
        export const LIGHTHOUSE_API_KEY = `LIGHTHOUSE-API-KEY`;

        export const OLIVE_SECRET_NAME = `olive-secret-pair`;
        export const OLIVE_BASE_URL = `OLIVE-BASE-URL`;
        export const OLIVE_PUBLIC_KEY = `OLIVE-PUBLIC-KEY`;
        export const OLIVE_PRIVATE_KEY = `OLIVE-PRIVATE-KEY`;
        export const OLIVE_WEBHOOK_KEY = `OLIVE-WEBHOOK-KEY`;
        export const OLIVE_MOONBEAM_DEFAULT_LOYALTY = `OLIVE-MOONBEAM-DEFAULT-LOYALTY`;
        export const OLIVE_MOONBEAM_ONLINE_LOYALTY = `OLIVE-MOONBEAM-ONLINE-LOYALTY`;
        export const OLIVE_MOONBEAM_FIDELIS_DEFAULT_LOYALTY = `OLIVE-MOONBEAM-FIDELIS-DEFAULT-LOYALTY`;
        export const OLIVE_MOONBEAM_PREMIER_ONLINE_LOYALTY = `OLIVE-MOONBEAM-PREMIER-ONLINE-LOYALTY`;
        export const OLIVE_MOONBEAM_PREMIER_NEARBY_LOYALTY = `OLIVE-MOONBEAM-PREMIER-NEARBY-LOYALTY`;
        export const OLIVE_MOONBEAM_VETERANS_DAY_LOYALTY = `OLIVE-MOONBEAM-VETERANS-DAY-LOYALTY`;
        export const OLIVE_MOONBEAM_CLICK_LOYALTY = `OLIVE-MOONBEAM-CLICK-LOYALTY`;
        export const OLIVE_MOONBEAM_PREMIER_CLICK_LOYALTY = `OLIVE-MOONBEAM-PREMIER-CLICK-LOYALTY`;

        export const APP_UPGRADE_SECRET_NAME = `app-upgrade-secret-pair`;
        export const APP_UPGRADE_API_KEY = `APP-UPGRADE-API-KEY`;
        export const APP_UPGRADE_BASE_URL = `APP-UPGRADE-BASE-URL`;
    }
}
