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
        MoonbeamConstants.FAQ_TABLE = 'FAQ_TABLE';
        MoonbeamConstants.MILITARY_VERIFICATION_TABLE = 'MILITARY_VERIFICATION_TABLE';
        MoonbeamConstants.PARTNER_MERCHANT_TABLE = 'PARTNER_MERCHANT_TABLE';
        MoonbeamConstants.CARD_LINKING_TABLE = 'CARD_LINKING_TABLE';
        MoonbeamConstants.CARD_LINKING_STATUS_GLOBAL_INDEX = 'CARD_LINKING_STATUS_GLOBAL_INDEX';
        MoonbeamConstants.TRANSACTIONS_TABLE = 'TRANSACTIONS_TABLE';
        MoonbeamConstants.PHYSICAL_DEVICES_TABLE = 'PHYSICAL_DEVICES_TABLE';
        MoonbeamConstants.PHYSICAL_DEVICES_ID_GLOBAL_INDEX = 'PHYSICAL_DEVICES_ID_GLOBAL_INDEX';
        MoonbeamConstants.PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX = 'PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX';
        MoonbeamConstants.NOTIFICATIONS_TABLE = 'NOTIFICATIONS_TABLE';
        MoonbeamConstants.NOTIFICATIONS_CHANNEL_TYPE_LOCAL_INDEX = 'NOTIFICATIONS_CHANNEL_TYPE_LOCAL_INDEX';
        MoonbeamConstants.NOTIFICATIONS_TYPE_LOCAL_INDEX = 'NOTIFICATIONS_TYPE_LOCAL_INDEX';
        MoonbeamConstants.NOTIFICATIONS_STATUS_LOCAL_INDEX = 'NOTIFICATIONS_STATUS_LOCAL_INDEX';
        MoonbeamConstants.REIMBURSEMENT_ELIGIBILITY_TABLE = 'REIMBURSEMENT_ELIGIBILITY_TABLE';
        MoonbeamConstants.REIMBURSEMENTS_TABLE = 'REIMBURSEMENTS_TABLE';
        MoonbeamConstants.REIMBURSEMENTS_PROCESSING_TOPIC_ARN = 'REIMBURSEMENTS_PROCESSING_TOPIC_ARN';
        MoonbeamConstants.REIMBURSEMENTS_ID_GLOBAL_INDEX = 'REIMBURSEMENTS_ID_GLOBAL_INDEX';
        MoonbeamConstants.REIMBURSEMENTS_STATUS_LOCAL_INDEX = 'REIMBURSEMENTS_STATUS_LOCAL_INDEX';
        MoonbeamConstants.UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN = 'UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN';
        MoonbeamConstants.TRANSACTIONS_PROCESSING_TOPIC_ARN = 'TRANSACTIONS_PROCESSING_TOPIC_ARN';
        MoonbeamConstants.TRANSACTIONS_ID_GLOBAL_INDEX = 'TRANSACTIONS_ID_GLOBAL_INDEX';
        MoonbeamConstants.TRANSACTIONS_STATUS_LOCAL_INDEX = 'TRANSACTIONS_STATUS_LOCAL_INDEX';
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
    })(AWSPairConstants = Constants.AWSPairConstants || (Constants.AWSPairConstants = {}));
})(Constants = exports.Constants || (exports.Constants = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi9Db25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7OztHQUdHO0FBQ0gsSUFBaUIsU0FBUyxDQTZHekI7QUE3R0QsV0FBaUIsU0FBUztJQUN0QixvRkFBb0Y7SUFDcEYsSUFBaUIsZ0JBQWdCLENBK0JoQztJQS9CRCxXQUFpQixnQkFBZ0I7UUFDN0Isa0JBQWtCO1FBQ0wsMkJBQVUsR0FBVSxnQkFBZ0IsQ0FBQztRQUNyQyx1QkFBTSxHQUFXLG9CQUFvQixDQUFDO1FBRW5ELG9CQUFvQjtRQUNQLGdDQUFlLEdBQVcsT0FBTyxDQUFDO1FBQ2xDLCtCQUFjLEdBQVcsTUFBTSxDQUFDO1FBQ2hDLHFDQUFvQixHQUFXLFlBQVksQ0FBQztRQUM1QyxvQ0FBbUIsR0FBVyxXQUFXLENBQUM7UUFDMUMsdUNBQXNCLEdBQVcsY0FBYyxDQUFDO1FBQ2hELDhCQUFhLEdBQVcsS0FBSyxDQUFDO1FBQzlCLDZDQUE0QixHQUFXLG9CQUFvQixDQUFDO1FBQzVELDJDQUEwQixHQUFXLGtCQUFrQixDQUFDO1FBQ3hELDJDQUEwQixHQUFXLGtCQUFrQixDQUFDO1FBQ3hELDZDQUE0QixHQUFXLG9CQUFvQixDQUFDO1FBQzVELDZDQUE0QixHQUFXLDJCQUEyQixDQUFDO1FBRWhGLGtCQUFrQjtRQUNMLHlDQUF3QixHQUFXLDhCQUE4QixDQUFDO1FBQ2xFLCtCQUFjLEdBQVcsb0JBQW9CLENBQUM7UUFDOUMsOEJBQWEsR0FBVyxtQkFBbUIsQ0FBQztRQUM1Qyx5Q0FBd0IsR0FBVyw4QkFBOEIsQ0FBQztRQUNsRSxzQkFBSyxHQUFXLE9BQU8sQ0FBQztRQUN4Qiw0Q0FBMkIsR0FBVyxpQ0FBaUMsQ0FBQztRQUN4RSx5Q0FBd0IsR0FBVyw4QkFBOEIsQ0FBQztRQUNsRSwwQ0FBeUIsR0FBVywrQkFBK0IsQ0FBQztRQUNwRSwwQ0FBeUIsR0FBVywrQkFBK0Is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Ryw0QkFBNEIsQ0FBQztRQUM5RSw4Q0FBNkIsR0FBRywrQkFBK0IsQ0FBQztRQUNoRSwwQ0FBeUIsR0FBRywyQkFBMkIsQ0FBQztRQUN4RCwyQ0FBMEIsR0FBRyw0QkFBNEIsQ0FBQztRQUMxRCxnREFBK0IsR0FBRyxpQ0FBaUMsQ0FBQztRQUNwRSwrQ0FBOEIsR0FBRyxnQ0FBZ0MsQ0FBQztRQUNsRSxvQ0FBbUIsR0FBRyxxQkFBcUIsQ0FBQztRQUM1QyxnQ0FBZSxHQUFHLGlCQUFpQixDQUFDO1FBQ3BDLGlDQUFnQixHQUFHLGtCQUFrQixDQUFDO1FBQ3RDLHVDQUFzQixHQUFHLHdCQUF3QixDQUFDO1FBQ2xELG9DQUFtQixHQUFHLHFCQUFxQixDQUFDO1FBQzVDLG1DQUFrQixHQUFHLG9CQUFvQixDQUFDO1FBQzFDLGtDQUFpQixHQUFHLG1CQUFtQixDQUFDO1FBQ3hDLCtCQUFjLEdBQUcsZ0JBQWdCLENBQUM7UUFDbEMsaUNBQWdCLEdBQUcsa0JBQWtCLENBQUM7UUFDdEMsa0NBQWlCLEdBQUcsbUJBQW1CLENBQUM7UUFDeEMsa0NBQWlCLEdBQUcsbUJBQW1CLENBQUM7UUFDeEMsK0NBQThCLEdBQUcsZ0NBQWdDLENBQUM7UUFDbEUsOENBQTZCLEdBQUcsK0JBQStCLENBQUM7UUFDaEUsdURBQXNDLEdBQUcsd0NBQXdDLENBQUM7SUFDbkcsQ0FBQyxFQTNCZ0IsZ0JBQWdCLEdBQWhCLDBCQUFnQixLQUFoQiwwQkFBZ0IsUUEyQmhDO0FBQ0wsQ0FBQyxFQTdHZ0IsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUE2R3pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGaWxlIHVzZWQgdG8gZGVmaW5lIGEgbmFtZXNwYWNlLCB0byBiZSB1c2VkIGluIGxheWluZyBvdXRcbiAqIGFsbCB0aGUgY29uc3RhbnRzIHVzZWQgdGhyb3VnaG91dC5cbiAqL1xuZXhwb3J0IG5hbWVzcGFjZSBDb25zdGFudHMge1xuICAgIC8vIEFtcGxpZnkgY29uc3RhbnRzIHVzZWQgaW4gbWFwcGluZyB0aGUgQ0RLIG91dHB1dHMgdG8gdGhlIEFXUyBleHBvcnRzIEFtcGxpZnkgZmlsZVxuICAgIGV4cG9ydCBuYW1lc3BhY2UgQW1wbGlmeUNvbnN0YW50cyB7XG4gICAgICAgIC8vIEdlbmVyYWwgcmVsYXRlZFxuICAgICAgICBleHBvcnQgY29uc3QgQU1QTElGWV9JRDpzdHJpbmcgPSAnYW1wbGlmeV9hcHBfaWQnO1xuICAgICAgICBleHBvcnQgY29uc3QgUkVHSU9OOiBzdHJpbmcgPSAnYXdzX3Byb2plY3RfcmVnaW9uJztcblxuICAgICAgICAvLyBBdHRyaWJ1dGUgcmVsYXRlZFxuICAgICAgICBleHBvcnQgY29uc3QgQVRUUklCVVRFX0VNQUlMOiBzdHJpbmcgPSAnRU1BSUwnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVRUUklCVVRFX05BTUU6IHN0cmluZyA9ICdOQU1FJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9VUERBVEVEX0FUOiBzdHJpbmcgPSAnVVBEQVRFRF9BVCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBVFRSSUJVVEVfQklSVEhEQVRFOiBzdHJpbmcgPSAnQklSVEhEQVRFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9QSE9ORV9OVU1CRVI6IHN0cmluZyA9ICdQSE9ORV9OVU1CRVInO1xuICAgICAgICBleHBvcnQgY29uc3QgQVRUUklCVVRFX1NNUzogc3RyaW5nID0gJ1NNUyc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBVFRSSUJVVEVfUkVRVUlSRVNfTE9XRVJDQVNFOiBzdHJpbmcgPSAnUkVRVUlSRVNfTE9XRVJDQVNFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9SRVFVSVJFU19OVU1CRVJTOiBzdHJpbmcgPSAnUkVRVUlSRVNfTlVNQkVSUyc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBVFRSSUJVVEVfUkVRVUlSRVNfU1lNQk9MUzogc3RyaW5nID0gJ1JFUVVJUkVTX1NZTUJPTFMnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVRUUklCVVRFX1JFUVVJUkVTX1VQUEVSQ0FTRTogc3RyaW5nID0gJ1JFUVVJUkVTX1VQUEVSQ0FTRSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBVFRSSUJVVEVfQ09HTklUT19VU0VSX1BPT0xTOiBzdHJpbmcgPSAnQU1BWk9OX0NPR05JVE9fVVNFUl9QT09MUyc7XG5cbiAgICAgICAgLy8gQ29nbml0byByZWxhdGVkXG4gICAgICAgIGV4cG9ydCBjb25zdCBDT0dOSVRPX0lERU5USVRZX1BPT0xfSUQ6IHN0cmluZyA9ICdhd3NfY29nbml0b19pZGVudGl0eV9wb29sX2lkJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IENPR05JVE9fUkVHSU9OOiBzdHJpbmcgPSAnYXdzX2NvZ25pdG9fcmVnaW9uJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFVTRVJfUE9PTFNfSUQ6IHN0cmluZyA9ICdhd3NfdXNlcl9wb29sc19pZCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBVU0VSX1BPT0xTX1dFQl9DTElFTlRfSUQ6IHN0cmluZyA9ICdhd3NfdXNlcl9wb29sc193ZWJfY2xpZW50X2lkJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9BVVRIOiBzdHJpbmcgPSAnb2F1dGgnO1xuICAgICAgICBleHBvcnQgY29uc3QgQ09HTklUT19VU0VSTkFNRV9BVFRSSUJVVEVTOiBzdHJpbmcgPSAnYXdzX2NvZ25pdG9fdXNlcm5hbWVfYXR0cmlidXRlcyc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT0dOSVRPX1NPQ0lBTF9QUk9WSURFUlM6IHN0cmluZyA9ICdhd3NfY29nbml0b19zb2NpYWxfcHJvdmlkZXJzJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IENPR05JVE9fU0lHTlVQX0FUVFJJQlVURVM6IHN0cmluZyA9ICdhd3NfY29nbml0b19zaWdudXBfYXR0cmlidXRlcyc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT0dOSVRPX01GQV9DT05GSUdVUkFUSU9OOiBzdHJpbmcgPSAnYXdzX2NvZ25pdG9fbWZhX2NvbmZpZ3VyYXRpb24nO1xuICAgICAgICBleHBvcnQgY29uc3QgQ09HTklUT19NRkFfVFlQRVM6IHN0cmluZyA9ICdhd3NfY29nbml0b19tZmFfdHlwZXMnO1xuICAgICAgICBleHBvcnQgY29uc3QgQ09HTklUT19QQVNTV09SRF9QUk9URUNUSU9OX1NFVFRJTkdTOiBzdHJpbmcgPSAnYXdzX2NvZ25pdG9fcGFzc3dvcmRfcHJvdGVjdGlvbl9zZXR0aW5ncyc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT0dOSVRPX1ZFUklGSUNBVElPTl9NRUNIQU5JU01TOiBzdHJpbmcgPSAnYXdzX2NvZ25pdG9fdmVyaWZpY2F0aW9uX21lY2hhbmlzbXMnO1xuICAgIH1cbiAgICAvLyBTdG9yYWdlIHJlbGF0ZWQgY29uc3RhbnRzXG4gICAgZXhwb3J0IG5hbWVzcGFjZSBTdG9yYWdlQ29uc3RhbnRzIHtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1PT05CRUFNX01BSU5fRklMRVNfS0VZX1BBSVJfSUQ6IHN0cmluZyA9ICdNT09OQkVBTV9NQUlOX0ZJTEVTX0tFWV9QQUlSX0lEJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1PT05CRUFNX01BSU5fRklMRVNfQ0xPVURGUk9OVF9ESVNUUklCVVRJT046IHN0cmluZyA9ICdNT09OQkVBTV9NQUlOX0ZJTEVTX0NMT1VERlJPTlRfRElTVFJJQlVUSU9OJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1PT05CRUFNX1BVQkxJQ19GSUxFU19CVUNLRVRfTkFNRTogc3RyaW5nID0gJ21vb25iZWFtLXB1YmxpYy1maWxlcy1idWNrZXQnO1xuICAgICAgICBleHBvcnQgY29uc3QgTU9PTkJFQU1fTUFJTl9GSUxFU19CVUNLRVRfTkFNRTogc3RyaW5nID0gJ21vb25iZWFtLWZpbGVzLWJ1Y2tldCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBBV1NfUzNfQlVDS0VUX1JFR0lPTjogc3RyaW5nID0gJ2F3c191c2VyX2ZpbGVzX3MzX2J1Y2tldF9yZWdpb24nO1xuICAgICAgICBleHBvcnQgY29uc3QgQVdTX1MzX0JVQ0tFVDogc3RyaW5nID0gJ2F3c191c2VyX2ZpbGVzX3MzX2J1Y2tldCc7XG4gICAgfVxuICAgIC8vIEFwcFN5bmMgY29uc3RhbnRzIHVzZWQgaW4gbWFwcGluZyB0aGUgQXBwU3luYyBDREsgb3V0cHV0cyB0byB0aGUgQVdTIGV4cG9ydHMgQW1wbGlmeSBmaWxlXG4gICAgZXhwb3J0IG5hbWVzcGFjZSBBcHBTeW5jQ29uc3RhbnRzIHtcbiAgICAgICAgZXhwb3J0IGNvbnN0IEFQUFNZTkNfRU5EUE9JTlQ6IHN0cmluZyA9ICdhd3NfYXBwc3luY19ncmFwaHFsRW5kcG9pbnQnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVBQU1lOQ19SRUdJT046IHN0cmluZyA9ICdhd3NfYXBwc3luY19yZWdpb24nO1xuICAgICAgICBleHBvcnQgY29uc3QgQVBQU1lOQ19BVVRIX1RZUEU6IHN0cmluZyA9ICdhd3NfYXBwc3luY19hdXRoZW50aWNhdGlvblR5cGUnO1xuICAgIH1cbiAgICAvLyBNb29uYmVhbSBzcGVjaWZpYyBjb25zdGFudHMgdXNlZCBpbiBtYXBwaW5nIHZhcmlvdXMgcmVzb3VyY2VzXG4gICAgZXhwb3J0IG5hbWVzcGFjZSBNb29uYmVhbUNvbnN0YW50cyB7XG4gICAgICAgIC8vIEluZnJhc3RydWN0dXJlIHJlbGF0ZWRcbiAgICAgICAgZXhwb3J0IGNvbnN0IEZBUV9UQUJMRTogc3RyaW5nID0gJ0ZBUV9UQUJMRSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBNSUxJVEFSWV9WRVJJRklDQVRJT05fVEFCTEU6IHN0cmluZyA9ICdNSUxJVEFSWV9WRVJJRklDQVRJT05fVEFCTEUnO1xuICAgICAgICBleHBvcnQgY29uc3QgUEFSVE5FUl9NRVJDSEFOVF9UQUJMRTogc3RyaW5nID0gJ1BBUlRORVJfTUVSQ0hBTlRfVEFCTEUnO1xuICAgICAgICBleHBvcnQgY29uc3QgQ0FSRF9MSU5LSU5HX1RBQkxFOiBzdHJpbmcgPSAnQ0FSRF9MSU5LSU5HX1RBQkxFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IENBUkRfTElOS0lOR19TVEFUVVNfR0xPQkFMX0lOREVYOiBzdHJpbmcgPSAnQ0FSRF9MSU5LSU5HX1NUQVRVU19HTE9CQUxfSU5ERVgnO1xuICAgICAgICBleHBvcnQgY29uc3QgVFJBTlNBQ1RJT05TX1RBQkxFOiBzdHJpbmcgPSAnVFJBTlNBQ1RJT05TX1RBQkxFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFBIWVNJQ0FMX0RFVklDRVNfVEFCTEU6IHN0cmluZyA9ICdQSFlTSUNBTF9ERVZJQ0VTX1RBQkxFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFBIWVNJQ0FMX0RFVklDRVNfSURfR0xPQkFMX0lOREVYOiBzdHJpbmcgPSAnUEhZU0lDQUxfREVWSUNFU19JRF9HTE9CQUxfSU5ERVgnO1xuICAgICAgICBleHBvcnQgY29uc3QgUEhZU0lDQUxfREVWSUNFU19UT0tFTl9JRF9HTE9CQUxfSU5ERVg6IHN0cmluZyA9ICdQSFlTSUNBTF9ERVZJQ0VTX1RPS0VOX0lEX0dMT0JBTF9JTkRFWCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBOT1RJRklDQVRJT05TX1RBQkxFOiBzdHJpbmcgPSAnTk9USUZJQ0FUSU9OU19UQUJMRSc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBOT1RJRklDQVRJT05TX0NIQU5ORUxfVFlQRV9MT0NBTF9JTkRFWDogc3RyaW5nID0gJ05PVElGSUNBVElPTlNfQ0hBTk5FTF9UWVBFX0xPQ0FMX0lOREVYJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IE5PVElGSUNBVElPTlNfVFlQRV9MT0NBTF9JTkRFWDogc3RyaW5nID0gJ05PVElGSUNBVElPTlNfVFlQRV9MT0NBTF9JTkRFWCc7XG4gICAgICAgIGV4cG9ydCBjb25zdCBOT1RJRklDQVRJT05TX1NUQVRVU19MT0NBTF9JTkRFWDogc3RyaW5nID0gJ05PVElGSUNBVElPTlNfU1RBVFVTX0xPQ0FMX0lOREVYJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFJFSU1CVVJTRU1FTlRfRUxJR0lCSUxJVFlfVEFCTEU6IHN0cmluZyA9ICdSRUlNQlVSU0VNRU5UX0VMSUdJQklMSVRZX1RBQkxFJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFJFSU1CVVJTRU1FTlRTX1RBQkxFOiBzdHJpbmcgPSAnUkVJTUJVUlNFTUVOVFNfVEFCTEUnO1xuICAgICAgICBleHBvcnQgY29uc3QgUkVJTUJVUlNFTUVOVFNfUFJPQ0VTU0lOR19UT1BJQ19BUk46IHN0cmluZyA9ICdSRUlNQlVSU0VNRU5UU19QUk9DRVNTSU5HX1RPUElDX0FSTic7XG4gICAgICAgIGV4cG9ydCBjb25zdCBSRUlNQlVSU0VNRU5UU19JRF9HTE9CQUxfSU5ERVg6IHN0cmluZyA9ICdSRUlNQlVSU0VNRU5UU19JRF9HTE9CQUxfSU5ERVgnO1xuICAgICAgICBleHBvcnQgY29uc3QgUkVJTUJVUlNFTUVOVFNfU1RBVFVTX0xPQ0FMX0lOREVYOiBzdHJpbmcgPSAnUkVJTUJVUlNFTUVOVFNfU1RBVFVTX0xPQ0FMX0lOREVYJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFVQREFURURfVFJBTlNBQ1RJT05TX1BST0NFU1NJTkdfVE9QSUNfQVJOOiBzdHJpbmcgPSAnVVBEQVRFRF9UUkFOU0FDVElPTlNfUFJPQ0VTU0lOR19UT1BJQ19BUk4nO1xuICAgICAgICBleHBvcnQgY29uc3QgVFJBTlNBQ1RJT05TX1BST0NFU1NJTkdfVE9QSUNfQVJOOiBzdHJpbmcgPSAnVFJBTlNBQ1RJT05TX1BST0NFU1NJTkdfVE9QSUNfQVJOJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFRSQU5TQUNUSU9OU19JRF9HTE9CQUxfSU5ERVg6IHN0cmluZyA9ICdUUkFOU0FDVElPTlNfSURfR0xPQkFMX0lOREVYJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IFRSQU5TQUNUSU9OU19TVEFUVVNfTE9DQUxfSU5ERVg6IHN0cmluZyA9ICdUUkFOU0FDVElPTlNfU1RBVFVTX0xPQ0FMX0lOREVYJztcbiAgICAgICAgZXhwb3J0IGNvbnN0IEVOVl9OQU1FOiBzdHJpbmcgPSAnRU5WX05BTUUnO1xuICAgICAgICBleHBvcnQgY29uc3QgQUNDT1VOVF9MSU5LUzogc3RyaW5nID0gJ0FDQ09VTlRfTElOS1MnO1xuICAgICAgICBleHBvcnQgY29uc3QgQVdTX1JFR0lPTjogc3RyaW5nID0gJ0FXU19SRUdJT04nO1xuICAgICAgICAvLyBHZW5lcmFsIHJlbGF0ZWRcbiAgICAgICAgZXhwb3J0IGNvbnN0IE5PTkVfT1JfQUJTRU5UOiBzdHJpbmcgPSAnTi9BJztcbiAgICB9XG4gICAgLy8gQVdTIFNlY3JldHMgTWFuYWdlciAocGFpci1iYXNlZCBjb25zdGFudHMpXG4gICAgZXhwb3J0IG5hbWVzcGFjZSBBV1NQYWlyQ29uc3RhbnRzIHtcbiAgICAgICAgZXhwb3J0IGNvbnN0IENPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUgPSBgY291cmllci1pbnRlcm5hbC1zZWNyZXQtcGFpcmA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBDT1VSSUVSX0JBU0VfVVJMID0gYENPVVJJRVJfQkFTRV9VUkxgO1xuICAgICAgICBleHBvcnQgY29uc3QgTkVXX1FVQUxJRllJTkdfT0ZGRVJfTk9USUZJQ0FUSU9OX0FVVEhfVE9LRU4gPSBgTkVXX1FVQUxJRllJTkdfT0ZGRVJfTk9USUZJQ0FUSU9OX0FVVEhfVE9LRU5gO1xuICAgICAgICBleHBvcnQgY29uc3QgTkVXX1FVQUxJRllJTkdfT0ZGRVJfTk9USUZJQ0FUSU9OX1RFTVBMQVRFX0lEID0gYE5FV19RVUFMSUZZSU5HX09GRkVSX05PVElGSUNBVElPTl9URU1QTEFURV9JRGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBORVdfVVNFUl9TSUdOVVBfTk9USUZJQ0FUSU9OX0FVVEhfVE9LRU4gPSBgTkVXX1VTRVJfU0lHTlVQX05PVElGSUNBVElPTl9BVVRIX1RPS0VOYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE5FV19VU0VSX1NJR05VUF9OT1RJRklDQVRJT05fVEVNUExBVEVfSUQgPSBgTkVXX1VTRVJfU0lHTlVQX05PVElGSUNBVElPTl9URU1QTEFURV9JRGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBNQUlOX0ZJTEVTX0NMT1VERlJPTlRfRElTVFJJQlVUSU9OX1NFQ1JFVF9OQU1FID0gYG1haW4tZmlsZXMtY2xvdWRmcm9udC1wYWlyYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FID0gYG1vb25iZWFtLWludGVybmFsLXNlY3JldC1wYWlyYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE1PT05CRUFNX0lOVEVSTkFMX0FQSV9LRVkgPSBgTU9PTkJFQU1fSU5URVJOQUxfQVBJX0tFWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBNT09OQkVBTV9JTlRFUk5BTF9CQVNFX1VSTCA9IGBNT09OQkVBTV9JTlRFUk5BTF9CQVNFX1VSTGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBNT09OQkVBTV9JTlRFUk5BTF9SRVNUX0JBU0VfVVJMID0gYE1PT05CRUFNX0lOVEVSTkFMX1JFU1RfQkFTRV9VUkxgO1xuICAgICAgICBleHBvcnQgY29uc3QgTU9PTkJFQU1fSU5URVJOQUxfUkVTVF9BUElfS0VZID0gYE1PT05CRUFNX0lOVEVSTkFMX1JFU1RfQVBJX0tFWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBRVUFORElTX1NFQ1JFVF9OQU1FID0gYHF1YW5kaXMtc2VjcmV0LXBhaXJgO1xuICAgICAgICBleHBvcnQgY29uc3QgUVVBTkRJU19BUElfS0VZID0gYFFVQU5ESVMtQVBJLUtFWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBRVUFORElTX0JBU0VfVVJMID0gYFFVQU5ESVMtQkFTRS1VUkxgO1xuICAgICAgICBleHBvcnQgY29uc3QgTElHSFRIT1VTRV9TRUNSRVRfTkFNRSA9IGBsaWdodGhvdXNlLXNlY3JldC1wYWlyYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IExJR0hUSE9VU0VfQkFTRV9VUkwgPSBgTElHSFRIT1VTRS1CQVNFLVVSTGA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBMSUdIVEhPVVNFX0FQSV9LRVkgPSBgTElHSFRIT1VTRS1BUEktS0VZYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX1NFQ1JFVF9OQU1FID0gYG9saXZlLXNlY3JldC1wYWlyYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX0JBU0VfVVJMID0gYE9MSVZFLUJBU0UtVVJMYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX1BVQkxJQ19LRVkgPSBgT0xJVkUtUFVCTElDLUtFWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBPTElWRV9QUklWQVRFX0tFWSA9IGBPTElWRS1QUklWQVRFLUtFWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBPTElWRV9XRUJIT09LX0tFWSA9IGBPTElWRS1XRUJIT09LLUtFWWA7XG4gICAgICAgIGV4cG9ydCBjb25zdCBPTElWRV9NT09OQkVBTV9ERUZBVUxUX0xPWUFMVFkgPSBgT0xJVkUtTU9PTkJFQU0tREVGQVVMVC1MT1lBTFRZYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX01PT05CRUFNX09OTElORV9MT1lBTFRZID0gYE9MSVZFLU1PT05CRUFNLU9OTElORS1MT1lBTFRZYDtcbiAgICAgICAgZXhwb3J0IGNvbnN0IE9MSVZFX01PT05CRUFNX0ZJREVMSVNfREVGQVVMVF9MT1lBTFRZID0gYE9MSVZFLU1PT05CRUFNLUZJREVMSVMtREVGQVVMVC1MT1lBTFRZYDtcbiAgICB9XG59XG4iXX0=