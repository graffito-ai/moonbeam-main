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

        // AppSync related
        export const APPSYNC_ENDPOINT: string = 'aws_appsync_graphqlEndpoint';
        export const APPSYNC_REGION: string = 'aws_appsync_region';
        export const APPSYNC_AUTH_TYPE: string = 'aws_appsync_authenticationType'
    }
    // Moonbeam specific constants used in mapping various resources
    export namespace MoonbeamConstants {
        // Infrastructure related
        export const MOONBEAM_PLAID_OAUTH_FILE_NAME: string = 'moonbeam-plaid-oauth';
        export const MOONBEAM_DEPLOYMENT_BUCKET_NAME: string = 'moonbeam-deployment-bucket';
        export const MOONBEAM_MAIN_FILES_BUCKET_NAME: string = 'moonbeam-files-bucket';
        export const MOONBEAM_MAIN_FILES_KEY_PAIR_ID: string = 'MOONBEAM_MAIN_FILES_KEY_PAIR_ID';
        export const MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION: string = 'MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION';
        export const REFERRAL_TABLE: string = 'REFERRAL_TABLE';
        export const ENV_NAME: string = 'ENV_NAME';
        export const ACCOUNT_LINKS: string = 'ACCOUNT_LINKS';
        export const AWS_REGION: string = 'AWS_REGION';
        // General related
        export const NONE_OR_ABSENT: string = 'N/A';
    }
    // AWS Secrets Manager (pair-based constants)
    export namespace AWSPairConstants {
        export const MAIN_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME = `main-files-cloudfront-pair`;
        export const MAIN_FILES_CLOUDFRONT_PRIVATE_KEY = 'MAIN_FILES_CLOUDFRONT_PRIVATE_KEY';
        export const PLAID_SECRET_NAME = 'plaid-pair';
        export const PLAID_CLIENT_ID = 'PLAID-CLIENT-ID';
        export const PLAID_SECRET = 'PLAID-SECRET';
    }
}