import {Duration, NestedStack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {
    AccountRecovery,
    NumberAttribute,
    StringAttribute,
    UserPool,
    UserPoolClient,
    UserPoolEmail,
    VerificationEmailStyle
} from "aws-cdk-lib/aws-cognito";
import {IdentityPool, UserPoolAuthenticationProvider} from "@aws-cdk/aws-cognito-identitypool-alpha";
import {FederatedPrincipal, Role} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Auth stack, used by Amplify.
 */
export class AmplifyAuthStack extends NestedStack {
    /**
     * Constructor for the Authentication stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'amplifyConfig'>) {
        super(scope, id, props);

        // create a user pool
        const cognitoUserPool = new UserPool(this, `${props.amplifyConfig!.amplifyAuthConfig.userPoolName}-${props.stage}`, {
            userPoolName: `${props.amplifyConfig!.amplifyAuthConfig.userPoolName}-${props.stage}`,
            selfSignUpEnabled: true,
            userVerification: {
                emailStyle: VerificationEmailStyle.CODE,
                emailSubject: 'Moonbeam verification code!',
                emailBody: 'Your Moonbeam verification code is: {####}'
            },
            autoVerify: {
                email: true
            },
            keepOriginal: {
                email: true
            },
            standardAttributes: {
                fullname: {
                    mutable: true,
                    required: true
                },
                email: {
                    mutable: true,
                    required: true
                },
                birthdate: {
                    mutable: true,
                    required: true
                },
                phoneNumber: {
                    mutable: true,
                    required: true
                },
                lastUpdateTime: {
                    mutable: true,
                    required: true
                }
            },
            customAttributes: {
                duty_station: new StringAttribute({
                    minLen: 2,
                    maxLen: 35,
                    mutable: true
                }),
                duty_status: new StringAttribute({
                    minLen: 7,
                    maxLen: 14,
                    mutable: true
                }),
                military_rank: new StringAttribute({
                    minLen: 2,
                    maxLen: 35,
                    mutable: true
                }),
                points: new NumberAttribute({
                    min: 0,
                    max: Number.MAX_SAFE_INTEGER,
                    mutable: true
                })
            },
            passwordPolicy: {
                tempPasswordValidity: Duration.days(7),
                minLength: 12,
                requireDigits: true,
                requireSymbols: true,
                requireUppercase: true,
                requireLowercase: true
            },
            // in the future, enable withSES, once the sending quota increases are approved
            email: UserPoolEmail.withCognito(),
            signInCaseSensitive: false,
            signInAliases: {
                email: true,
            },
            accountRecovery: AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
            /**
             * in the future, once we enable Face ID, we should enable this
             * deviceTracking
             */
        });

        // create a user pool client for the Amplify frontend
        const userPoolFrontendClient = new UserPoolClient(this,
            `${props.amplifyConfig!.amplifyAuthConfig.userPoolFrontendClientName}-${props.stage}`, {
                userPool: cognitoUserPool
            });


        // create a user pool identity from the user pool and the frontend client defined above
        new IdentityPool(this,
            `${props.amplifyConfig!.amplifyAuthConfig.userPoolIdentityFrontendPoolName}-${props.stage}`, {
                identityPoolName: `${props.amplifyConfig!.amplifyAuthConfig.userPoolIdentityFrontendPoolName}-${props.stage}`,
                allowUnauthenticatedIdentities: false,
                authenticationProviders: {
                    userPools: [
                        new UserPoolAuthenticationProvider({
                            userPool: cognitoUserPool,
                            userPoolClient: userPoolFrontendClient
                        })
                    ]
                },
                // create an authenticated role to be used with any user pool identities
                authenticatedRole: new Role(this, `${props.amplifyConfig!.amplifyAuthConfig.authenticatedRoleName}-${props.stage}`, {
                    roleName: `${props.amplifyConfig!.amplifyAuthConfig.authenticatedRoleName}-${props.stage}`,
                    description: 'IAM Role to be used as an Authenticated role for the Cognito user pool identities, used by Amplify',
                    assumedBy: new FederatedPrincipal(
                        'cognito-identity.amazonaws.com',
                        {
                            "StringEquals": {
                                // this identity pool id has to be hardcoded because it cannot be retrieved until after it's created
                                "cognito-identity.amazonaws.com:aud": `us-west-2:5952e8ee-6645-46ac-b2db-0f3ebd3fc502`
                            },
                            "ForAnyValue:StringLike": {
                                "cognito-identity.amazonaws.com:amr": "authenticated"
                            }
                        },
                        'sts:AssumeRoleWithWebIdentity'
                    ),
                    maxSessionDuration: Duration.hours(1)
                }),
                // create an unauthenticated role to be used with any user pool identities
                unauthenticatedRole: new Role(this, `${props.amplifyConfig!.amplifyAuthConfig.unauthenticatedRoleName}-${props.stage}`, {
                    roleName: `${props.amplifyConfig!.amplifyAuthConfig.unauthenticatedRoleName}-${props.stage}`,
                    description: 'IAM Role to be used as an Unauthenticated role for the Cognito user pool identities, used by Amplify',
                    assumedBy: new FederatedPrincipal(
                        'cognito-identity.amazonaws.com',
                        {
                            "StringEquals": {
                                // this identity pool id has to be hardcoded because it cannot be retrieved until after it's created
                                "cognito-identity.amazonaws.com:aud": `us-west-2:5952e8ee-6645-46ac-b2db-0f3ebd3fc502`
                            },
                            "ForAnyValue:StringLike": {
                                "cognito-identity.amazonaws.com:amr": "unauthenticated"
                            }
                        },
                        'sts:AssumeRoleWithWebIdentity'
                    ),
                    maxSessionDuration: Duration.hours(1)
                })
            });
    }
}
