"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
/**
 * File used to define a namespace, to be used in laying out
 * all the constants used throughout.
 */
var Constants;
(function (Constants) {
    // Amplify constants used in mapping the CDK outputs to the AWS exports Amplify file
    let AmplifyConstants;
    (function (AmplifyConstants) {
        // General related
        AmplifyConstants.AMPLIFY_ID = 'amplify_app_id';
        AmplifyConstants.REGION = 'aws_project_region';
        // Attribute related
        AmplifyConstants.ATTRIBUTE_EMAIL = 'EMAIL';
        AmplifyConstants.ATTRIBUTE_NAME = 'NAME';
        AmplifyConstants.ATTRIBUTE_UPDATED_AT = 'UPDATED_AT';
        AmplifyConstants.ATTRIBUTE_BIRTHDATE = 'BIRTHDATE';
        AmplifyConstants.ATTRIBUTE_PHONE_NUMBER = 'PHONE_NUMBER';
        AmplifyConstants.ATTRIBUTE_SMS = 'SMS';
        AmplifyConstants.ATTRIBUTE_REQUIRES_LOWERCASE = 'REQUIRES_LOWERCASE';
        AmplifyConstants.ATTRIBUTE_REQUIRES_NUMBERS = 'REQUIRES_NUMBERS';
        AmplifyConstants.ATTRIBUTE_REQUIRES_SYMBOLS = 'REQUIRES_SYMBOLS';
        AmplifyConstants.ATTRIBUTE_REQUIRES_UPPERCASE = 'REQUIRES_UPPERCASE';
        AmplifyConstants.ATTRIBUTE_COGNITO_USER_POOLS = 'AMAZON_COGNITO_USER_POOLS';
        // Cognito related
        AmplifyConstants.COGNITO_IDENTITY_POOL_ID = 'aws_cognito_identity_pool_id';
        AmplifyConstants.COGNITO_REGION = 'aws_cognito_region';
        AmplifyConstants.USER_POOLS_ID = 'aws_user_pools_id';
        AmplifyConstants.USER_POOLS_WEB_CLIENT_ID = 'aws_user_pools_web_client_id';
        AmplifyConstants.OAUTH = 'oauth';
        AmplifyConstants.COGNITO_USERNAME_ATTRIBUTES = 'aws_cognito_username_attributes';
        AmplifyConstants.COGNITO_SOCIAL_PROVIDERS = 'aws_cognito_social_providers';
        AmplifyConstants.COGNITO_SIGNUP_ATTRIBUTES = 'aws_cognito_signup_attributes';
        AmplifyConstants.COGNITO_MFA_CONFIGURATION = 'aws_cognito_mfa_configuration';
        AmplifyConstants.COGNITO_MFA_TYPES = 'aws_cognito_mfa_types';
        AmplifyConstants.COGNITO_PASSWORD_PROTECTION_SETTINGS = 'aws_cognito_password_protection_settings';
        AmplifyConstants.COGNITO_VERIFICATION_MECHANISMS = 'aws_cognito_verification_mechanisms';
    })(AmplifyConstants = Constants.AmplifyConstants || (Constants.AmplifyConstants = {}));
    // Storage related constants
    let StorageConstants;
    (function (StorageConstants) {
        StorageConstants.MOONBEAM_MAIN_FILES_KEY_PAIR_ID = 'MOONBEAM_MAIN_FILES_KEY_PAIR_ID';
        StorageConstants.MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION = 'MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION';
        StorageConstants.MOONBEAM_PUBLIC_FILES_BUCKET_NAME = 'moonbeam-public-files-bucket';
        StorageConstants.MOONBEAM_MILITARY_VERIFICATION_REPORTING_BUCKET_NAME = 'moonbeam-military-verification-reporting-bucket';
        StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME = 'moonbeam-files-bucket';
        StorageConstants.AWS_S3_BUCKET_REGION = 'aws_user_files_s3_bucket_region';
        StorageConstants.AWS_S3_BUCKET = 'aws_user_files_s3_bucket';
    })(StorageConstants = Constants.StorageConstants || (Constants.StorageConstants = {}));
    // AppSync constants used in mapping the AppSync CDK outputs to the AWS exports Amplify file
    let AppSyncConstants;
    (function (AppSyncConstants) {
        AppSyncConstants.APPSYNC_ENDPOINT = 'aws_appsync_graphqlEndpoint';
        AppSyncConstants.APPSYNC_REGION = 'aws_appsync_region';
        AppSyncConstants.APPSYNC_AUTH_TYPE = 'aws_appsync_authenticationType';
    })(AppSyncConstants = Constants.AppSyncConstants || (Constants.AppSyncConstants = {}));
    // Moonbeam specific constants used in mapping various resources
    let MoonbeamConstants;
    (function (MoonbeamConstants) {
        // Infrastructure related
        MoonbeamConstants.MOONBEAM_FRONTEND_LOG_GROUP_NAME = 'MOONBEAM_FRONTEND_LOG_GROUP_NAME';
        MoonbeamConstants.AWS_LAMBDA_INITIALIZATION_TYPE = 'AWS_LAMBDA_INITIALIZATION_TYPE';
        MoonbeamConstants.AWS_LAMBDA_PROVISIONED_CONCURRENCY = 'provisioned-concurrency';
        MoonbeamConstants.USER_AUTH_SESSION_TABLE = 'USER_AUTH_SESSION_TABLE';
        MoonbeamConstants.FAQ_TABLE = 'FAQ_TABLE';
        MoonbeamConstants.NOTIFICATION_REMINDER_TABLE = 'NOTIFICATION_REMINDER_TABLE';
        MoonbeamConstants.MILITARY_VERIFICATION_TABLE = 'MILITARY_VERIFICATION_TABLE';
        MoonbeamConstants.PARTNER_MERCHANT_TABLE = 'PARTNER_MERCHANT_TABLE';
        MoonbeamConstants.CARD_LINKING_TABLE = 'CARD_LINKING_TABLE';
        MoonbeamConstants.CARD_LINKING_STATUS_GLOBAL_INDEX = 'CARD_LINKING_STATUS_GLOBAL_INDEX';
        MoonbeamConstants.REFERRAL_TABLE = 'REFERRAL_TABLE';
        MoonbeamConstants.REFERRAL_STATUS_GLOBAL_INDEX = 'REFERRAL_STATUS_GLOBAL_INDEX';
        MoonbeamConstants.TRANSACTIONS_TABLE = 'TRANSACTIONS_TABLE';
        MoonbeamConstants.PHYSICAL_DEVICES_TABLE = 'PHYSICAL_DEVICES_TABLE';
        MoonbeamConstants.PHYSICAL_DEVICES_ID_GLOBAL_INDEX = 'PHYSICAL_DEVICES_ID_GLOBAL_INDEX';
        MoonbeamConstants.PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX = 'PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX';
        MoonbeamConstants.NOTIFICATIONS_TABLE = 'NOTIFICATIONS_TABLE';
        MoonbeamConstants.NOTIFICATIONS_CHANNEL_TYPE_LOCAL_INDEX = 'NOTIFICATIONS_CHANNEL_TYPE_LOCAL_INDEX';
        MoonbeamConstants.NOTIFICATIONS_TYPE_LOCAL_INDEX = 'NOTIFICATIONS_TYPE_LOCAL_INDEX';
        MoonbeamConstants.NOTIFICATIONS_STATUS_LOCAL_INDEX = 'NOTIFICATIONS_STATUS_LOCAL_INDEX';
        MoonbeamConstants.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN = 'NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN';
        MoonbeamConstants.UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN = 'UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN';
        MoonbeamConstants.REFERRAL_PROCESSING_TOPIC_ARN = 'REFERRAL_PROCESSING_TOPIC_ARN';
        MoonbeamConstants.TRANSACTIONS_PROCESSING_TOPIC_ARN = 'TRANSACTIONS_PROCESSING_TOPIC_ARN';
        MoonbeamConstants.MILITARY_VERIFICATION_NOTIFICATION_PROCESSING_TOPIC_ARN = 'MILITARY_VERIFICATION_NOTIFICATION_PROCESSING_TOPIC_ARN';
        MoonbeamConstants.TRANSACTIONS_ID_GLOBAL_INDEX = 'TRANSACTIONS_ID_GLOBAL_INDEX';
        MoonbeamConstants.TRANSACTIONS_STATUS_LOCAL_INDEX = 'TRANSACTIONS_STATUS_LOCAL_INDEX';
        MoonbeamConstants.MILITARY_VERIFICATION_STATUS_GLOBAL_INDEX = 'MILITARY_VERIFICATION_STATUS_GLOBAL_INDEX';
        MoonbeamConstants.ENV_NAME = 'ENV_NAME';
        MoonbeamConstants.ACCOUNT_LINKS = 'ACCOUNT_LINKS';
        MoonbeamConstants.AWS_REGION = 'AWS_REGION';
        // General related
        MoonbeamConstants.NONE_OR_ABSENT = 'N/A';
    })(MoonbeamConstants = Constants.MoonbeamConstants || (Constants.MoonbeamConstants = {}));
    // AWS Secrets Manager (pair-based constants)
    let AWSPairConstants;
    (function (AWSPairConstants) {
        AWSPairConstants.COURIER_INTERNAL_SECRET_NAME = `courier-internal-secret-pair`;
        AWSPairConstants.COURIER_BASE_URL = `COURIER_BASE_URL`;
        AWSPairConstants.COGNITO_USER_POOL_ID = `COGNITO_USER_POOL_ID`;
        AWSPairConstants.CONGITO_CLI_ACCESS_KEY_ID = `CONGITO_CLI_ACCESS_KEY_ID`;
        AWSPairConstants.COGNITO_CLI_SECRET_ACCESS_KEY = `COGNITO_CLI_SECRET_ACCESS_KEY`;
        AWSPairConstants.PUSH_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN = `PUSH_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN`;
        AWSPairConstants.PUSH_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID = `PUSH_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID`;
        AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN = `EMAIL_REFERRAL_TEMPLATE_LAUNCH_AUTH_TOKEN`;
        AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID = `EMAIL_REFERRAL_TEMPLATE_LAUNCH_TEMPLATE_ID`;
        AWSPairConstants.PUSH_REFERRAL_TEMPLATE_1_AUTH_TOKEN = `PUSH_REFERRAL_TEMPLATE_1_AUTH_TOKEN`;
        AWSPairConstants.PUSH_REFERRAL_TEMPLATE_1_TEMPLATE_ID = `PUSH_REFERRAL_TEMPLATE_1_TEMPLATE_ID`;
        AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_1_AUTH_TOKEN = `EMAIL_REFERRAL_TEMPLATE_1_AUTH_TOKEN`;
        AWSPairConstants.EMAIL_REFERRAL_TEMPLATE_1_TEMPLATE_ID = `EMAIL_REFERRAL_TEMPLATE_1_TEMPLATE_ID`;
        AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_1_AUTH_TOKEN = `PUSH_VETERANS_DAY_TEMPLATE_1_AUTH_TOKEN`;
        AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_1_TEMPLATE_ID = `PUSH_VETERANS_DAY_TEMPLATE_1_TEMPLATE_ID`;
        AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_2_AUTH_TOKEN = `PUSH_VETERANS_DAY_TEMPLATE_2_AUTH_TOKEN`;
        AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_2_TEMPLATE_ID = `PUSH_VETERANS_DAY_TEMPLATE_2_TEMPLATE_ID`;
        AWSPairConstants.EMAIL_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN = `EMAIL_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN`;
        AWSPairConstants.EMAIL_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID = `EMAIL_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID`;
        AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN = `PUSH_VETERANS_DAY_TEMPLATE_3_AUTH_TOKEN`;
        AWSPairConstants.PUSH_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID = `PUSH_VETERANS_DAY_TEMPLATE_3_TEMPLATE_ID`;
        AWSPairConstants.EMAIL_CARD_LINKING_REMINDER_AUTH_TOKEN = `EMAIL_CARD_LINKING_REMINDER_AUTH_TOKEN`;
        AWSPairConstants.EMAIL_CARD_LINKING_REMINDER_TEMPLATE_ID = `EMAIL_CARD_LINKING_REMINDER_TEMPLATE_ID`;
        AWSPairConstants.PUSH_CARD_LINKING_REMINDER_AUTH_TOKEN = `PUSH_CARD_LINKING_REMINDER_AUTH_TOKEN`;
        AWSPairConstants.PUSH_CARD_LINKING_REMINDER_TEMPLATE_ID = `PUSH_CARD_LINKING_REMINDER_TEMPLATE_ID`;
        AWSPairConstants.EMAIL_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN = `EMAIL_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN`;
        AWSPairConstants.EMAIL_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID = `EMAIL_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID`;
        AWSPairConstants.PUSH_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN = `PUSH_NEW_MAP_FEATURE_REMINDER_AUTH_TOKEN`;
        AWSPairConstants.PUSH_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID = `PUSH_NEW_MAP_FEATURE_REMINDER_TEMPLATE_ID`;
        AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN = `EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN`;
        AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID = `EMAIL_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID`;
        AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN = `EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN`;
        AWSPairConstants.EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID = `EMAIL_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID`;
        AWSPairConstants.PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN = `PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_AUTH_TOKEN`;
        AWSPairConstants.PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID = `PUSH_STATUS_CHANGED_PENDING_TO_REJECTED_TEMPLATE_ID`;
        AWSPairConstants.PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN = `PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_AUTH_TOKEN`;
        AWSPairConstants.PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID = `PUSH_STATUS_CHANGED_PENDING_TO_VERIFIED_TEMPLATE_ID`;
        AWSPairConstants.NEW_QUALIFYING_OFFER_NOTIFICATION_AUTH_TOKEN = `NEW_QUALIFYING_OFFER_NOTIFICATION_AUTH_TOKEN`;
        AWSPairConstants.NEW_QUALIFYING_OFFER_NOTIFICATION_TEMPLATE_ID = `NEW_QUALIFYING_OFFER_NOTIFICATION_TEMPLATE_ID`;
        AWSPairConstants.NEW_USER_SIGNUP_NOTIFICATION_AUTH_TOKEN = `NEW_USER_SIGNUP_NOTIFICATION_AUTH_TOKEN`;
        AWSPairConstants.NEW_USER_SIGNUP_NOTIFICATION_TEMPLATE_ID = `NEW_USER_SIGNUP_NOTIFICATION_TEMPLATE_ID`;
        AWSPairConstants.MAIN_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME = `main-files-cloudfront-pair`;
        AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME = `moonbeam-internal-secret-pair`;
        AWSPairConstants.MOONBEAM_INTERNAL_API_KEY = `MOONBEAM_INTERNAL_API_KEY`;
        AWSPairConstants.MOONBEAM_INTERNAL_BASE_URL = `MOONBEAM_INTERNAL_BASE_URL`;
        AWSPairConstants.MOONBEAM_INTERNAL_REST_BASE_URL = `MOONBEAM_INTERNAL_REST_BASE_URL`;
        AWSPairConstants.MOONBEAM_INTERNAL_REST_API_KEY = `MOONBEAM_INTERNAL_REST_API_KEY`;
        AWSPairConstants.QUANDIS_SECRET_NAME = `quandis-secret-pair`;
        AWSPairConstants.QUANDIS_API_KEY = `QUANDIS-API-KEY`;
        AWSPairConstants.QUANDIS_BASE_URL = `QUANDIS-BASE-URL`;
        AWSPairConstants.LIGHTHOUSE_SECRET_NAME = `lighthouse-secret-pair`;
        AWSPairConstants.LIGHTHOUSE_BASE_URL = `LIGHTHOUSE-BASE-URL`;
        AWSPairConstants.LIGHTHOUSE_API_KEY = `LIGHTHOUSE-API-KEY`;
        AWSPairConstants.OLIVE_SECRET_NAME = `olive-secret-pair`;
        AWSPairConstants.OLIVE_BASE_URL = `OLIVE-BASE-URL`;
        AWSPairConstants.OLIVE_PUBLIC_KEY = `OLIVE-PUBLIC-KEY`;
        AWSPairConstants.OLIVE_PRIVATE_KEY = `OLIVE-PRIVATE-KEY`;
        AWSPairConstants.OLIVE_WEBHOOK_KEY = `OLIVE-WEBHOOK-KEY`;
        AWSPairConstants.OLIVE_MOONBEAM_DEFAULT_LOYALTY = `OLIVE-MOONBEAM-DEFAULT-LOYALTY`;
        AWSPairConstants.OLIVE_MOONBEAM_ONLINE_LOYALTY = `OLIVE-MOONBEAM-ONLINE-LOYALTY`;
        AWSPairConstants.OLIVE_MOONBEAM_FIDELIS_DEFAULT_LOYALTY = `OLIVE-MOONBEAM-FIDELIS-DEFAULT-LOYALTY`;
        AWSPairConstants.OLIVE_MOONBEAM_PREMIER_ONLINE_LOYALTY = `OLIVE-MOONBEAM-PREMIER-ONLINE-LOYALTY`;
        AWSPairConstants.OLIVE_MOONBEAM_PREMIER_NEARBY_LOYALTY = `OLIVE-MOONBEAM-PREMIER-NEARBY-LOYALTY`;
        AWSPairConstants.OLIVE_MOONBEAM_VETERANS_DAY_LOYALTY = `OLIVE-MOONBEAM-VETERANS-DAY-LOYALTY`;
        AWSPairConstants.OLIVE_MOONBEAM_CLICK_LOYALTY = `OLIVE-MOONBEAM-CLICK-LOYALTY`;
        AWSPairConstants.OLIVE_MOONBEAM_PREMIER_CLICK_LOYALTY = `OLIVE-MOONBEAM-PREMIER-CLICK-LOYALTY`;
        AWSPairConstants.APP_UPGRADE_SECRET_NAME = `app-upgrade-secret-pair`;
        AWSPairConstants.APP_UPGRADE_API_KEY = `APP-UPGRADE-API-KEY`;
        AWSPairConstants.APP_UPGRADE_BASE_URL = `APP-UPGRADE-BASE-URL`;
    })(AWSPairConstants = Constants.AWSPairConstants || (Constants.AWSPairConstants = {}));
})(Constants = exports.Constants || (exports.Constants = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi9Db25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7OztHQUdHO0FBQ0gsSUFBaUIsU0FBUyxDQTRLekI7QUE1S0QsV0FBaUIsU0FBUztJQUN0QixvRkFBb0Y7SUFDcEYsSUFBaUIsZ0JBQWdCLENBK0JoQztJQS9CRCxXQUFpQixnQkFBZ0I7UUFDN0Isa0JBQWtCO1FBQ0wsMkJBQVUsR0FBVSxnQkFBZ0IsQ0FBQztRQUNyQyx1QkFBTSxHQUFXLG9CQUFvQixDQUFDO1FBRW5ELG9CQUFvQjtRQUNQLGdDQUFlLEdBQVcsT0FBTyxDQUFDO1FBQ2xDLCtCQUFjLEdBQVcsTUFBTSxDQUFDO1FBQ2hDLHFDQUFvQixHQUFXLFlBQVksQ0FBQztRQUM1QyxvQ0FBbUIsR0FBVyxXQUFXLENBQUM7UUFDMUMsdUNBQXNCLEdBQVcsY0FBYyxDQUFDO1FBQ2hELDhCQUFhLEdBQVcsS0FBSyxDQUFDO1FBQzlCLDZDQUE0QixHQUFXLG9CQUFvQixDQUFDO1FBQzVELDJDQUEwQixHQUFXLGtCQUFrQixDQUFDO1FBQ3hELDJDQUEwQixHQUFXLGtCQUFrQixDQUFDO1FBQ3hELDZDQUE0QixHQUFXLG9CQUFvQixDQUFDO1FBQzVELDZDQUE0QixHQUFXLDJCQUEyQixDQUFDO1FBRWhGLGtCQUFrQjtRQUNMLHlDQUF3QixHQUFXLDhCQUE4QixDQUFDO1FBQ2xFLCtCQUFjLEdBQVcsb0JBQW9CLENBQUM7UUFDOUMsOEJBQWEsR0FBVyxtQkFBbUIsQ0FBQztRQUM1Qyx5Q0FBd0IsR0FBVyw4QkFBOEIsQ0FBQztRQUNsRSxzQkFBSyxHQUFXLE9BQU8sQ0FBQztRQUN4Qiw0Q0FBMkIsR0FBVyxpQ0FBaUMsQ0FBQztRQUN4RSx5Q0FBd0IsR0FBVyw4QkFBOEIsQ0FBQztRQUNsRSwwQ0FBeUIsR0FBVywrQkFBK0IsQ0FBQztRQUNwRSwwQ0FBeUIsR0FBVywrQkFBK0Is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QkFBK0IsQ0FBQztRQUNoRSx1REFBc0MsR0FBRyx3Q0FBd0MsQ0FBQztRQUNsRixzREFBcUMsR0FBRyx1Q0FBdUMsQ0FBQztRQUNoRixzREFBcUMsR0FBRyx1Q0FBdUMsQ0FBQztRQUNoRixvREFBbUMsR0FBRyxxQ0FBcUMsQ0FBQztRQUM1RSw2Q0FBNEIsR0FBRyw4QkFBOEIsQ0FBQztRQUM5RCxxREFBb0MsR0FBRyxzQ0FBc0MsQ0FBQztRQUU5RSx3Q0FBdUIsR0FBRyx5QkFBeUIsQ0FBQztRQUNwRCxvQ0FBbUIsR0FBRyxxQkFBcUIsQ0FBQztRQUM1QyxxQ0FBb0IsR0FBRyxzQkFBc0IsQ0FBQztJQUMvRCxDQUFDLEVBbkZnQixnQkFBZ0IsR0FBaEIsMEJBQWdCLEtBQWhCLDBCQUFnQixRQW1GaEM7QUFDTCxDQUFDLEVBNUtnQixTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQTRLekIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEZpbGUgdXNlZCB0byBkZWZpbmUgYSBuYW1lc3BhY2UsIHRvIGJlIHVzZWQgaW4gbGF5aW5nIG91dFxuICogYWxsIHRoZSBjb25zdGFudHMgdXNlZCB0aHJvdWdob3V0LlxuICovXG5leHBvcnQgbmFtZXNwYWNlIENvbnN0YW50cyB7XG4gICAgLy8gQW1wbGlmeSBjb25zdGFudHMgdXNlZCBpbiBtYXBwaW5nIHRoZSBDREsgb3V0cHV0cyB0byB0aGUgQVdTIGV4cG9ydHMgQW1wbGlmeSBmaWxlXG4gICAgZXhwb3J0IG5hbWVzcGFjZSBBbXBsaWZ5Q29uc3RhbnRzIHtcbiAgICAgICAgLy8gR2VuZXJhbCByZWxhdGVkXG4gICAgICAgIGV4cG9ydCBjb25zdCBBTVBMSUZZX0lEOnN0cmluZyA9ICdhbXBsaWZ5X2FwcF9pZCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBSRUdJT046IHN0cmluZyA9ICdhd3NfcHJvamVjdF9yZWdpb24nO1xuXG4gICAgICAgIC8vIEF0dHJpYnV0ZSByZWxhdGVkXG4gICAgICAgIGV4cG9ydCBjb25zdCBBVFRSSUJVVEVfRU1BSUw6IHN0cmluZyA9ICdFTUFJTCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBVFRSSUJVVEVfTkFNRTogc3RyaW5nID0gJ05BTUUnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVRUUklCVVRFX1VQREFURURfQVQ6IHN0cmluZyA9ICdVUERBVEVEX0FUJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9CSVJUSERBVEU6IHN0cmluZyA9ICdCSVJUSERBVEUnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVRUUklCVVRFX1BIT05FX05VTUJFUjogc3RyaW5nID0gJ1BIT05FX05VTUJFUic7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBVFRSSUJVVEVfU01TOiBzdHJpbmcgPSAnU01TJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9SRVFVSVJFU19MT1dFUkNBU0U6IHN0cmluZyA9ICdSRVFVSVJFU19MT1dFUkNBU0UnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVRUUklCVVRFX1JFUVVJUkVTX05VTUJFUlM6IHN0cmluZyA9ICdSRVFVSVJFU19OVU1CRVJTJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9SRVFVSVJFU19TWU1CT0xTOiBzdHJpbmcgPSAnUkVRVUlSRVNfU1lNQk9MUyc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBVFRSSUJVVEVfUkVRVUlSRVNfVVBQRVJDQVNFOiBzdHJpbmcgPSAnUkVRVUlSRVNfVVBQRVJDQVNFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9DT0dOSVRPX1VTRVJfUE9PTFM6IHN0cmluZyA9ICdBTUFaT05fQ09HTklUT19VU0VSX1BPT0xTJztcblxuICAgICAgICAvLyBDb2duaXRvIHJlbGF0ZWRcbiAgICAgICAgZXhwb3J0IGNvbnN0IENPR05JVE9fSURFTlRJVFlfUE9PTF9JRDogc3RyaW5nID0gJ2F3c19jb2duaXRvX2lkZW50aXR5X3Bvb2xfaWQnO1xuICAgICAgICBleHBvcnQgY29uc3QgQ09HTklUT19SRUdJT046IHN0cmluZyA9ICdhd3NfY29nbml0b19yZWdpb24nO1xuICAgICAgICBleHBvcnQgY29uc3QgVVNFUl9QT09MU19JRDogc3RyaW5nID0gJ2F3c191c2VyX3Bvb2xzX2lkJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFVTRVJfUE9PTFNfV0VCX0NMSUVOVF9JRDogc3RyaW5nID0gJ2F3c191c2VyX3Bvb2xzX3dlYl9jbGllbnRfaWQnO1xuICAgICAgICBleHBvcnQgY29uc3QgT0FVVEg6IHN0cmluZyA9ICdvYXV0aCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT0dOSVRPX1VTRVJOQU1FX0FUVFJJQlVURVM6IHN0cmluZyA9ICdhd3NfY29nbml0b191c2VybmFtZV9hdHRyaWJ1dGVzJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IENPR05JVE9fU09DSUFMX1BST1ZJREVSUzogc3RyaW5nID0gJ2F3c19jb2duaXRvX3NvY2lhbF9wcm92aWRlcnMnO1xuICAgICAgICBleHBvcnQgY29uc3QgQ09HTklUT19TSUdOVVBfQVRUUklCVVRFUzogc3RyaW5nID0gJ2F3c19jb2duaXRvX3NpZ251cF9hdHRyaWJ1dGVzJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IENPR05JVE9fTUZBX0NPTkZJR1VSQVRJT046IHN0cmluZyA9ICdhd3NfY29nbml0b19tZmFfY29uZmlndXJhdGlvbic7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT0dOSVRPX01GQV9UWVBFUzogc3RyaW5nID0gJ2F3c19jb2duaXRvX21mYV90eXBlcyc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT0dOSVRPX1BBU1NXT1JEX1BST1RFQ1RJT05fU0VUVElOR1M6IHN0cmluZyA9ICdhd3NfY29nbml0b19wYXNzd29yZF9wcm90ZWN0aW9uX3NldHRpbmdzJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IENPR05JVE9fVkVSSUZJQ0FUSU9OX01FQ0hBTklTTVM6IHN0cmluZyA9ICdhd3NfY29nbml0b192ZXJpZmljYXRpb25fbWVjaGFuaXNtcyc7XG4gICAgfVxuICAgIC8vIFN0b3JhZ2UgcmVsYXRlZCBjb25zdGFudHNcbiAgICBleHBvcnQgbmFtZXNwYWNlIFN0b3JhZ2VDb25zdGFudHMge1xuICAgICAgICBleHBvcnQgY29uc3QgTU9PTkJFQU1fTUFJTl9GSUxFU19LRVlfUEFJUl9JRDogc3RyaW5nID0gJ01PT05CRUFNX01BSU5fRklMRVNfS0VZX1BBSVJfSUQnO1xuICAgICAgICBleHBvcnQgY29uc3QgTU9PTkJFQU1fTUFJTl9GSUxFU19DTE9VREZST05UX0RJU1RSSUJVVElPTjogc3RyaW5nID0gJ01PT05CRUFNX01BSU5fRklMRVNfQ0xPVURGUk9OVF9ESVNUUklCVVRJT04nO1xuICAgICAgICBleHBvcnQgY29uc3QgTU9PTkJFQU1fUFVCTElDX0ZJTEVTX0JVQ0tFVF9OQU1FOiBzdHJpbmcgPSAnbW9vbmJlYW0tcHVibGljLWZpbGVzLWJ1Y2tldCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBNT09OQkVBTV9NSUxJVEFSWV9WRVJJRklDQVRJT05fUkVQT1JUSU5HX0JVQ0tFVF9OQU1FOiBzdHJpbmcgPSAnbW9vbmJlYW0tbWlsaXRhcnktdmVyaWZpY2F0aW9uLXJlcG9ydGluZy1idWNrZXQnO1xuICAgICAgICBleHBvcnQgY29uc3QgTU9PTkJFQU1fTUFJTl9GSUxFU19CVUNLRVRfTkFNRTogc3RyaW5nID0gJ21vb25iZWFtLWZpbGVzLWJ1Y2tldCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBV1NfUzNfQlVDS0VUX1JFR0lPTjogc3RyaW5nID0gJ2F3c191c2VyX2ZpbGVzX3MzX2J1Y2tldF9yZWdpb24nO1xuICAgICAgICBleHBvcnQgY29uc3QgQVdTX1MzX0JVQ0tFVDogc3RyaW5nID0gJ2F3c191c2VyX2ZpbGVzX3MzX2J1Y2tldCc7XG4gICAgfVxuICAgIC8vIEFwcFN5bmMgY29uc3RhbnRzIHVzZWQgaW4gbWFwcGluZyB0aGUgQXBwU3luYyBDREsgb3V0cHV0cyB0byB0aGUgQVdTIGV4cG9ydHMgQW1wbGlmeSBmaWxlXG4gICAgZXhwb3J0IG5hbWVzcGFjZSBBcHBTeW5jQ29uc3RhbnRzIHtcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFQUFNZTkNfRU5EUE9JTlQ6IHN0cmluZyA9ICdhd3NfYXBwc3luY19ncmFwaHFsRW5kcG9pbnQnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVBQU1lOQ19SRUdJT046IHN0cmluZyA9ICdhd3NfYXBwc3luY19yZWdpb24nO1xuICAgICAgICBleHBvcnQgY29uc3QgQVBQU1lOQ19BVVRIX1RZUEU6IHN0cmluZyA9ICdhd3NfYXBwc3luY19hdXRoZW50aWNhdGlvblR5cGUnO1xuICAgIH1cbiAgICAvLyBNb29uYmVhbSBzcGVjaWZpYyBjb25zdGFudHMgdXNlZCBpbiBtYXBwaW5nIHZhcmlvdXMgcmVzb3VyY2VzXG4gICAgZXhwb3J0IG5hbWVzcGFjZSBNb29uYmVhbUNvbnN0YW50cyB7XG4gICAgICAgIC8vIEluZnJhc3RydWN0dXJlIHJlbGF0ZWRcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1PT05CRUFNX0ZST05URU5EX0xPR19HUk9VUF9OQU1FID0gJ01PT05CRUFNX0ZST05URU5EX0xPR19HUk9VUF9OQU1FJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFXU19MQU1CREFfSU5JVElBTElaQVRJT05fVFlQRSA9ICdBV1NfTEFNQkRBX0lOSVRJQUxJWkFUSU9OX1RZUEUnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVdTX0xBTUJEQV9QUk9WSVNJT05FRF9DT05DVVJSRU5DWSA9ICdwcm92aXNpb25lZC1jb25jdXJyZW5jeSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBVU0VSX0FVVEhfU0VTU0lPTl9UQUJMRSA9ICdVU0VSX0FVVEhfU0VTU0lPTl9UQUJMRSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBGQVFfVEFCTEU6IHN0cmluZyA9ICdGQVFfVEFCTEUnO1xuICAgICAgICBleHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OX1JFTUlOREVSX1RBQkxFOiBzdHJpbmcgPSAnTk9USUZJQ0FUSU9OX1JFTUlOREVSX1RBQkxFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1JTElUQVJZX1ZFUklGSUNBVElPTl9UQUJMRTogc3RyaW5nID0gJ01JTElUQVJZX1ZFUklGSUNBVElPTl9UQUJMRSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQQVJUTkVSX01FUkNIQU5UX1RBQkxFOiBzdHJpbmcgPSAnUEFSVE5FUl9NRVJDSEFOVF9UQUJMRSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDQVJEX0xJTktJTkdfVEFCTEU6IHN0cmluZyA9ICdDQVJEX0xJTktJTkdfVEFCTEUnO1xuICAgICAgICBleHBvcnQgY29uc3QgQ0FSRF9MSU5LSU5HX1NUQVRVU19HTE9CQUxfSU5ERVg6IHN0cmluZyA9ICdDQVJEX0xJTktJTkdfU1RBVFVTX0dMT0JBTF9JTkRFWCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBSRUZFUlJBTF9UQUJMRTogc3RyaW5nID0gJ1JFRkVSUkFMX1RBQkxFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFJFRkVSUkFMX1NUQVRVU19HTE9CQUxfSU5ERVg6IHN0cmluZyA9ICdSRUZFUlJBTF9TVEFUVVNfR0xPQkFMX0lOREVYJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFRSQU5TQUNUSU9OU19UQUJMRTogc3RyaW5nID0gJ1RSQU5TQUNUSU9OU19UQUJMRSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQSFlTSUNBTF9ERVZJQ0VTX1RBQkxFOiBzdHJpbmcgPSAnUEhZU0lDQUxfREVWSUNFU19UQUJMRSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQSFlTSUNBTF9ERVZJQ0VTX0lEX0dMT0JBTF9JTkRFWDogc3RyaW5nID0gJ1BIWVNJQ0FMX0RFVklDRVNfSURfR0xPQkFMX0lOREVYJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFBIWVNJQ0FMX0RFVklDRVNfVE9LRU5fSURfR0xPQkFMX0lOREVYOiBzdHJpbmcgPSAnUEhZU0lDQUxfREVWSUNFU19UT0tFTl9JRF9HTE9CQUxfSU5ERVgnO1xuICAgICAgICBleHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19UQUJMRTogc3RyaW5nID0gJ05PVElGSUNBVElPTlNfVEFCTEUnO1xuICAgICAgICBleHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19DSEFOTkVMX1RZUEVfTE9DQUxfSU5ERVg6IHN0cmluZyA9ICdOT1RJRklDQVRJT05TX0NIQU5ORUxfVFlQRV9MT0NBTF9JTkRFWCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBOT1RJRklDQVRJT05TX1RZUEVfTE9DQUxfSU5ERVg6IHN0cmluZyA9ICdOT1RJRklDQVRJT05TX1RZUEVfTE9DQUxfSU5ERVgnO1xuICAgICAgICBleHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19TVEFUVVNfTE9DQUxfSU5ERVg6IHN0cmluZyA9ICdOT1RJRklDQVRJT05TX1NUQVRVU19MT0NBTF9JTkRFWCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBOT1RJRklDQVRJT05fUkVNSU5ERVJfUFJPQ0VTU0lOR19UT1BJQ19BUk46IHN0cmluZyA9ICdOT1RJRklDQVRJT05fUkVNSU5ERVJfUFJPQ0VTU0lOR19UT1BJQ19BUk4nO1xuICAgICAgICBleHBvcnQgY29uc3QgVVBEQVRFRF9UUkFOU0FDVElPTlNfUFJPQ0VTU0lOR19UT1BJQ19BUk46IHN0cmluZyA9ICdVUERBVEVEX1RSQU5TQUNUSU9OU19QUk9DRVNTSU5HX1RPUElDX0FSTic7XG4gICAgICAgIGV4cG9ydCBjb25zdCBSRUZFUlJBTF9QUk9DRVNTSU5HX1RPUElDX0FSTjogc3RyaW5nID0gJ1JFRkVSUkFMX1BST0NFU1NJTkdfVE9QSUNfQVJOJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFRSQU5TQUNUSU9OU19QUk9DRVNTSU5HX1RPUElDX0FSTjogc3RyaW5nID0gJ1RSQU5TQUNUSU9OU19QUk9DRVNTSU5HX1RPUElDX0FSTic7XG4gICAgICAgIGV4cG9ydCBjb25zdCBNSUxJVEFSWV9WRVJJRklDQVRJT05fTk9USUZJQ0FUSU9OX1BST0NFU1NJTkdfVE9QSUNfQVJOOiBzdHJpbmcgPSAnTUlMSVRBUllfVkVSSUZJQ0FUSU9OX05PVElGSUNBVElPTl9QUk9DRVNTSU5HX1RPUElDX0FSTic7XG4gICAgICAgIGV4cG9ydCBjb25zdCBUUkFOU0FDVElPTlNfSURfR0xPQkFMX0lOREVYOiBzdHJpbmcgPSAnVFJBTlNBQ1RJT05TX0lEX0dMT0JBTF9JTkRFWCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBUUkFOU0FDVElPTlNfU1RBVFVTX0xPQ0FMX0lOREVYOiBzdHJpbmcgPSAnVFJBTlNBQ1RJT05TX1NUQVRVU19MT0NBTF9JTkRFWCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBNSUxJVEFSWV9WRVJJRklDQVRJT05fU1RBVFVTX0dMT0JBTF9JTkRFWDogc3RyaW5nID0gJ01JTElUQVJZX1ZFUklGSUNBVElPTl9TVEFUVVNfR0xPQkFMX0lOREVYJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEVOVl9OQU1FOiBzdHJpbmcgPSAnRU5WX05BTUUnO1xuICAgICAgICBleHBvcnQgY29uc3QgQUNDT1VOVF9MSU5LUzogc3RyaW5nID0gJ0FDQ09VTlRfTElOS1MnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVdTX1JFR0lPTjogc3RyaW5nID0gJ0FXU19SRUdJT04nO1xuICAgICAgICAvLyBHZW5lcmFsIHJlbGF0ZWRcbiAgICAgICAgZXhwb3J0IGNvbnN0IE5PTkVfT1JfQUJTRU5UOiBzdHJpbmcgPSAnTi9BJztcbiAgICB9XG4gICAgLy8gQVdTIFNlY3JldHMgTWFuYWdlciAocGFpci1iYXNlZCBjb25zdGFudHMpXG4gICAgZXhwb3J0IG5hbWVzcGFjZSBBV1NQYWlyQ29uc3RhbnRzIHtcbiAgICAgICAgZXhwb3J0IGNvbnN0IENPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUgPSBgY291cmllci1pbnRlcm5hbC1zZWNyZXQtcGFpcmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT1VSSUVSX0JBU0VfVVJMID0gYENPVVJJRVJfQkFTRV9VUkxgO1xuXG4gICAgICAgIGV4cG9ydCBjb25zdCBDT0dOSVRPX1VTRVJfUE9PTF9JRCA9IGBDT0dOSVRPX1VTRVJfUE9PTF9JRGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT05HSVRPX0NMSV9BQ0NFU1NfS0VZX0lEID0gYENPTkdJVE9fQ0xJX0FDQ0VTU19LRVlfSURgO1xuICAgICAgICBleHBvcnQgY29uc3QgQ09HTklUT19DTElfU0VDUkVUX0FDQ0VTU19LRVkgPSBgQ09HTklUT19DTElfU0VDUkVUX0FDQ0VTU19LRVlgO1xuXG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX1JFRkVSUkFMX1RFTVBMQVRFX0xBVU5DSF9BVVRIX1RPS0VOID0gYFBVU0hfUkVGRVJSQUxfVEVNUExBVEVfTEFVTkNIX0FVVEhfVE9LRU5gO1xuICAgICAgICBleHBvcnQgY29uc3QgUFVTSF9SRUZFUlJBTF9URU1QTEFURV9MQVVOQ0hfVEVNUExBVEVfSUQgPSBgUFVTSF9SRUZFUlJBTF9URU1QTEFURV9MQVVOQ0hfVEVNUExBVEVfSURgO1xuICAgICAgICBleHBvcnQgY29uc3QgRU1BSUxfUkVGRVJSQUxfVEVNUExBVEVfTEFVTkNIX0FVVEhfVE9LRU4gPSBgRU1BSUxfUkVGRVJSQUxfVEVNUExBVEVfTEFVTkNIX0FVVEhfVE9LRU5gO1xuICAgICAgICBleHBvcnQgY29uc3QgRU1BSUxfUkVGRVJSQUxfVEVNUExBVEVfTEFVTkNIX1RFTVBMQVRFX0lEID0gYEVNQUlMX1JFRkVSUkFMX1RFTVBMQVRFX0xBVU5DSF9URU1QTEFURV9JRGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX1JFRkVSUkFMX1RFTVBMQVRFXzFfQVVUSF9UT0tFTiA9IGBQVVNIX1JFRkVSUkFMX1RFTVBMQVRFXzFfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX1JFRkVSUkFMX1RFTVBMQVRFXzFfVEVNUExBVEVfSUQgPSBgUFVTSF9SRUZFUlJBTF9URU1QTEFURV8xX1RFTVBMQVRFX0lEYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IEVNQUlMX1JFRkVSUkFMX1RFTVBMQVRFXzFfQVVUSF9UT0tFTiA9IGBFTUFJTF9SRUZFUlJBTF9URU1QTEFURV8xX0FVVEhfVE9LRU5gO1xuICAgICAgICBleHBvcnQgY29uc3QgRU1BSUxfUkVGRVJSQUxfVEVNUExBVEVfMV9URU1QTEFURV9JRCA9IGBFTUFJTF9SRUZFUlJBTF9URU1QTEFURV8xX1RFTVBMQVRFX0lEYDtcblxuICAgICAgICBleHBvcnQgY29uc3QgUFVTSF9WRVRFUkFOU19EQVlfVEVNUExBVEVfMV9BVVRIX1RPS0VOID0gYFBVU0hfVkVURVJBTlNfREFZX1RFTVBMQVRFXzFfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX1ZFVEVSQU5TX0RBWV9URU1QTEFURV8xX1RFTVBMQVRFX0lEID0gYFBVU0hfVkVURVJBTlNfREFZX1RFTVBMQVRFXzFfVEVNUExBVEVfSURgO1xuICAgICAgICBleHBvcnQgY29uc3QgUFVTSF9WRVRFUkFOU19EQVlfVEVNUExBVEVfMl9BVVRIX1RPS0VOID0gYFBVU0hfVkVURVJBTlNfREFZX1RFTVBMQVRFXzJfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX1ZFVEVSQU5TX0RBWV9URU1QTEFURV8yX1RFTVBMQVRFX0lEID0gYFBVU0hfVkVURVJBTlNfREFZX1RFTVBMQVRFXzJfVEVNUExBVEVfSURgO1xuXG4gICAgICAgIGV4cG9ydCBjb25zdCBFTUFJTF9WRVRFUkFOU19EQVlfVEVNUExBVEVfM19BVVRIX1RPS0VOID0gYEVNQUlMX1ZFVEVSQU5TX0RBWV9URU1QTEFURV8zX0FVVEhfVE9LRU5gO1xuICAgICAgICBleHBvcnQgY29uc3QgRU1BSUxfVkVURVJBTlNfREFZX1RFTVBMQVRFXzNfVEVNUExBVEVfSUQgPSBgRU1BSUxfVkVURVJBTlNfREFZX1RFTVBMQVRFXzNfVEVNUExBVEVfSURgO1xuICAgICAgICBleHBvcnQgY29uc3QgUFVTSF9WRVRFUkFOU19EQVlfVEVNUExBVEVfM19BVVRIX1RPS0VOID0gYFBVU0hfVkVURVJBTlNfREFZX1RFTVBMQVRFXzNfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX1ZFVEVSQU5TX0RBWV9URU1QTEFURV8zX1RFTVBMQVRFX0lEID0gYFBVU0hfVkVURVJBTlNfREFZX1RFTVBMQVRFXzNfVEVNUExBVEVfSURgO1xuXG4gICAgICAgIGV4cG9ydCBjb25zdCBFTUFJTF9DQVJEX0xJTktJTkdfUkVNSU5ERVJfQVVUSF9UT0tFTiA9IGBFTUFJTF9DQVJEX0xJTktJTkdfUkVNSU5ERVJfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBFTUFJTF9DQVJEX0xJTktJTkdfUkVNSU5ERVJfVEVNUExBVEVfSUQgPSBgRU1BSUxfQ0FSRF9MSU5LSU5HX1JFTUlOREVSX1RFTVBMQVRFX0lEYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IFBVU0hfQ0FSRF9MSU5LSU5HX1JFTUlOREVSX0FVVEhfVE9LRU4gPSBgUFVTSF9DQVJEX0xJTktJTkdfUkVNSU5ERVJfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX0NBUkRfTElOS0lOR19SRU1JTkRFUl9URU1QTEFURV9JRCA9IGBQVVNIX0NBUkRfTElOS0lOR19SRU1JTkRFUl9URU1QTEFURV9JRGA7XG5cbiAgICAgICAgZXhwb3J0IGNvbnN0IEVNQUlMX05FV19NQVBfRkVBVFVSRV9SRU1JTkRFUl9BVVRIX1RPS0VOID0gYEVNQUlMX05FV19NQVBfRkVBVFVSRV9SRU1JTkRFUl9BVVRIX1RPS0VOYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IEVNQUlMX05FV19NQVBfRkVBVFVSRV9SRU1JTkRFUl9URU1QTEFURV9JRCA9IGBFTUFJTF9ORVdfTUFQX0ZFQVRVUkVfUkVNSU5ERVJfVEVNUExBVEVfSURgO1xuICAgICAgICBleHBvcnQgY29uc3QgUFVTSF9ORVdfTUFQX0ZFQVRVUkVfUkVNSU5ERVJfQVVUSF9UT0tFTiA9IGBQVVNIX05FV19NQVBfRkVBVFVSRV9SRU1JTkRFUl9BVVRIX1RPS0VOYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IFBVU0hfTkVXX01BUF9GRUFUVVJFX1JFTUlOREVSX1RFTVBMQVRFX0lEID0gYFBVU0hfTkVXX01BUF9GRUFUVVJFX1JFTUlOREVSX1RFTVBMQVRFX0lEYDtcblxuICAgICAgICBleHBvcnQgY29uc3QgRU1BSUxfU1RBVFVTX0NIQU5HRURfUEVORElOR19UT19SRUpFQ1RFRF9BVVRIX1RPS0VOID0gYEVNQUlMX1NUQVRVU19DSEFOR0VEX1BFTkRJTkdfVE9fUkVKRUNURURfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBFTUFJTF9TVEFUVVNfQ0hBTkdFRF9QRU5ESU5HX1RPX1JFSkVDVEVEX1RFTVBMQVRFX0lEID0gYEVNQUlMX1NUQVRVU19DSEFOR0VEX1BFTkRJTkdfVE9fUkVKRUNURURfVEVNUExBVEVfSURgO1xuICAgICAgICBleHBvcnQgY29uc3QgRU1BSUxfU1RBVFVTX0NIQU5HRURfUEVORElOR19UT19WRVJJRklFRF9BVVRIX1RPS0VOID0gYEVNQUlMX1NUQVRVU19DSEFOR0VEX1BFTkRJTkdfVE9fVkVSSUZJRURfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBFTUFJTF9TVEFUVVNfQ0hBTkdFRF9QRU5ESU5HX1RPX1ZFUklGSUVEX1RFTVBMQVRFX0lEID0gYEVNQUlMX1NUQVRVU19DSEFOR0VEX1BFTkRJTkdfVE9fVkVSSUZJRURfVEVNUExBVEVfSURgO1xuICAgICAgICBleHBvcnQgY29uc3QgUFVTSF9TVEFUVVNfQ0hBTkdFRF9QRU5ESU5HX1RPX1JFSkVDVEVEX0FVVEhfVE9LRU4gPSBgUFVTSF9TVEFUVVNfQ0hBTkdFRF9QRU5ESU5HX1RPX1JFSkVDVEVEX0FVVEhfVE9LRU5gO1xuICAgICAgICBleHBvcnQgY29uc3QgUFVTSF9TVEFUVVNfQ0hBTkdFRF9QRU5ESU5HX1RPX1JFSkVDVEVEX1RFTVBMQVRFX0lEID0gYFBVU0hfU1RBVFVTX0NIQU5HRURfUEVORElOR19UT19SRUpFQ1RFRF9URU1QTEFURV9JRGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX1NUQVRVU19DSEFOR0VEX1BFTkRJTkdfVE9fVkVSSUZJRURfQVVUSF9UT0tFTiA9IGBQVVNIX1NUQVRVU19DSEFOR0VEX1BFTkRJTkdfVE9fVkVSSUZJRURfQVVUSF9UT0tFTmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBQVVNIX1NUQVRVU19DSEFOR0VEX1BFTkRJTkdfVE9fVkVSSUZJRURfVEVNUExBVEVfSUQgPSBgUFVTSF9TVEFUVVNfQ0hBTkdFRF9QRU5ESU5HX1RPX1ZFUklGSUVEX1RFTVBMQVRFX0lEYDtcblxuICAgICAgICBleHBvcnQgY29uc3QgTkVXX1FVQUxJRllJTkdfT0ZGRVJfTk9USUZJQ0FUSU9OX0FVVEhfVE9LRU4gPSBgTkVXX1FVQUxJRllJTkdfT0ZGRVJfTk9USUZJQ0FUSU9OX0FVVEhfVE9LRU5gO1xuICAgICAgICBleHBvcnQgY29uc3QgTkVXX1FVQUxJRllJTkdfT0ZGRVJfTk9USUZJQ0FUSU9OX1RFTVBMQVRFX0lEID0gYE5FV19RVUFMSUZZSU5HX09GRkVSX05PVElGSUNBVElPTl9URU1QTEFURV9JRGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBORVdfVVNFUl9TSUdOVVBfTk9USUZJQ0FUSU9OX0FVVEhfVE9LRU4gPSBgTkVXX1VTRVJfU0lHTlVQX05PVElGSUNBVElPTl9BVVRIX1RPS0VOYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE5FV19VU0VSX1NJR05VUF9OT1RJRklDQVRJT05fVEVNUExBVEVfSUQgPSBgTkVXX1VTRVJfU0lHTlVQX05PVElGSUNBVElPTl9URU1QTEFURV9JRGA7XG5cbiAgICAgICAgZXhwb3J0IGNvbnN0IE1BSU5fRklMRVNfQ0xPVURGUk9OVF9ESVNUUklCVVRJT05fU0VDUkVUX05BTUUgPSBgbWFpbi1maWxlcy1jbG91ZGZyb250LXBhaXJgO1xuICAgICAgICBleHBvcnQgY29uc3QgTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUgPSBgbW9vbmJlYW0taW50ZXJuYWwtc2VjcmV0LXBhaXJgO1xuICAgICAgICBleHBvcnQgY29uc3QgTU9PTkJFQU1fSU5URVJOQUxfQVBJX0tFWSA9IGBNT09OQkVBTV9JTlRFUk5BTF9BUElfS0VZYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1PT05CRUFNX0lOVEVSTkFMX0JBU0VfVVJMID0gYE1PT05CRUFNX0lOVEVSTkFMX0JBU0VfVVJMYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1PT05CRUFNX0lOVEVSTkFMX1JFU1RfQkFTRV9VUkwgPSBgTU9PTkJFQU1fSU5URVJOQUxfUkVTVF9CQVNFX1VSTGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBNT09OQkVBTV9JTlRFUk5BTF9SRVNUX0FQSV9LRVkgPSBgTU9PTkJFQU1fSU5URVJOQUxfUkVTVF9BUElfS0VZYDtcblxuICAgICAgICBleHBvcnQgY29uc3QgUVVBTkRJU19TRUNSRVRfTkFNRSA9IGBxdWFuZGlzLXNlY3JldC1wYWlyYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IFFVQU5ESVNfQVBJX0tFWSA9IGBRVUFORElTLUFQSS1LRVlgO1xuICAgICAgICBleHBvcnQgY29uc3QgUVVBTkRJU19CQVNFX1VSTCA9IGBRVUFORElTLUJBU0UtVVJMYDtcblxuICAgICAgICBleHBvcnQgY29uc3QgTElHSFRIT1VTRV9TRUNSRVRfTkFNRSA9IGBsaWdodGhvdXNlLXNlY3JldC1wYWlyYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IExJR0hUSE9VU0VfQkFTRV9VUkwgPSBgTElHSFRIT1VTRS1CQVNFLVVSTGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBMSUdIVEhPVVNFX0FQSV9LRVkgPSBgTElHSFRIT1VTRS1BUEktS0VZYDtcblxuICAgICAgICBleHBvcnQgY29uc3QgT0xJVkVfU0VDUkVUX05BTUUgPSBgb2xpdmUtc2VjcmV0LXBhaXJgO1xuICAgICAgICBleHBvcnQgY29uc3QgT0xJVkVfQkFTRV9VUkwgPSBgT0xJVkUtQkFTRS1VUkxgO1xuICAgICAgICBleHBvcnQgY29uc3QgT0xJVkVfUFVCTElDX0tFWSA9IGBPTElWRS1QVUJMSUMtS0VZYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX1BSSVZBVEVfS0VZID0gYE9MSVZFLVBSSVZBVEUtS0VZYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX1dFQkhPT0tfS0VZID0gYE9MSVZFLVdFQkhPT0stS0VZYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX01PT05CRUFNX0RFRkFVTFRfTE9ZQUxUWSA9IGBPTElWRS1NT09OQkVBTS1ERUZBVUxULUxPWUFMVFlgO1xuICAgICAgICBleHBvcnQgY29uc3QgT0xJVkVfTU9PTkJFQU1fT05MSU5FX0xPWUFMVFkgPSBgT0xJVkUtTU9PTkJFQU0tT05MSU5FLUxPWUFMVFlgO1xuICAgICAgICBleHBvcnQgY29uc3QgT0xJVkVfTU9PTkJFQU1fRklERUxJU19ERUZBVUxUX0xPWUFMVFkgPSBgT0xJVkUtTU9PTkJFQU0tRklERUxJUy1ERUZBVUxULUxPWUFMVFlgO1xuICAgICAgICBleHBvcnQgY29uc3QgT0xJVkVfTU9PTkJFQU1fUFJFTUlFUl9PTkxJTkVfTE9ZQUxUWSA9IGBPTElWRS1NT09OQkVBTS1QUkVNSUVSLU9OTElORS1MT1lBTFRZYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX01PT05CRUFNX1BSRU1JRVJfTkVBUkJZX0xPWUFMVFkgPSBgT0xJVkUtTU9PTkJFQU0tUFJFTUlFUi1ORUFSQlktTE9ZQUxUWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBPTElWRV9NT09OQkVBTV9WRVRFUkFOU19EQVlfTE9ZQUxUWSA9IGBPTElWRS1NT09OQkVBTS1WRVRFUkFOUy1EQVktTE9ZQUxUWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBPTElWRV9NT09OQkVBTV9DTElDS19MT1lBTFRZID0gYE9MSVZFLU1PT05CRUFNLUNMSUNLLUxPWUFMVFlgO1xuICAgICAgICBleHBvcnQgY29uc3QgT0xJVkVfTU9PTkJFQU1fUFJFTUlFUl9DTElDS19MT1lBTFRZID0gYE9MSVZFLU1PT05CRUFNLVBSRU1JRVItQ0xJQ0stTE9ZQUxUWWA7XG5cbiAgICAgICAgZXhwb3J0IGNvbnN0IEFQUF9VUEdSQURFX1NFQ1JFVF9OQU1FID0gYGFwcC11cGdyYWRlLXNlY3JldC1wYWlyYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFQUF9VUEdSQURFX0FQSV9LRVkgPSBgQVBQLVVQR1JBREUtQVBJLUtFWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBUFBfVVBHUkFERV9CQVNFX1VSTCA9IGBBUFAtVVBHUkFERS1CQVNFLVVSTGA7XG4gICAgfVxufVxuIl19