import {Duration, NestedStack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {
    AccountRecovery,
    StringAttribute,
    UserPool,
    UserPoolClient,
    UserPoolEmail,
    VerificationEmailStyle
} from "aws-cdk-lib/aws-cognito";
import {IdentityPool, UserPoolAuthenticationProvider} from "@aws-cdk/aws-cognito-identitypool-alpha";
import {FederatedPrincipal, Role} from "aws-cdk-lib/aws-iam";
import {AmplifyConfiguration} from "../models/ServiceConfiguration";

/**
 * File used to define the Auth stack, used by Amplify.
 */
export class AmplifyAuthStack extends NestedStack {

    /**
     * Since this is a nested stack, the CfnOutputs do not accurately work. Thus, in order to take advantage of the CfnOutputs
     * and display them from the parent stack, in order to eventually write them to a file, we will store them in a variable, accessible
     * from the parent stack.
     */
    readonly outputs: string[];

    /**
     * Constructor for the Authentication stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage'> & Pick<AmplifyConfiguration, 'amplifyAuthConfig'>) {
        super(scope, id, props);

        // create a user pool
        const cognitoUserPool = new UserPool(this, `${props.amplifyAuthConfig.userPoolName}-${props.stage}-${props.env!.region}`, {
            userPoolName: `${props.amplifyAuthConfig.userPoolName}-${props.stage}-${props.env!.region}`,
            selfSignUpEnabled: true,
            userVerification: {
                emailSubject: 'Verify your email for Moonbeam!',
                emailBody: 'Thanks for signing up to Moonbeam! Your verification code is {####}. Never share it!',
                emailStyle: VerificationEmailStyle.CODE,
                smsMessage: 'Your Moonbeam verification code is {####}. Don\'t share it!'
            },
            userInvitation: {
                emailSubject: 'Invite to join Moonbeam!',
                emailBody: 'Hello, {username}, your temporary password for your new Moonbeam account is {####}. Never share it!',
                smsMessage: 'Hello {username}, your temporary password for Moonbeam is {####}. Never share it!'
            },
            signInAliases: {
                email: true,
                // phone: true
            },
            autoVerify: {
                email: true,
                // phone: true
            },
            keepOriginal: {
                email: true,
                // phone: true
            },
            standardAttributes: {
                address: {
                    mutable: true,
                    required: false
                },
                gender: {
                    mutable: true,
                    required: false
                },
                givenName: {
                    mutable: true,
                    required: true
                },
                middleName: {
                    mutable: true,
                    required: false
                },
                familyName: {
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
                duty_status: new StringAttribute({
                    minLen: 7,
                    maxLen: 14,
                    mutable: true
                }),
                userId: new StringAttribute({
                    minLen: 36,
                    maxLen: 36,
                    mutable: false
                })
            },
            passwordPolicy: {
                tempPasswordValidity: Duration.hours(48),
                minLength: 12,
                requireDigits: true,
                requireSymbols: true,
                requireUppercase: true,
                requireLowercase: true
            },
            email: UserPoolEmail.withSES({
                fromEmail: `noreply-${props.stage}@moonbeam.vet`,
                fromName: 'Moonbeam App',
                replyTo: 'info@moonbeam.vet',
            }),
            // mfa: Mfa.REQUIRED,
            // mfaMessage: "Your Moonbeam verification code is {####}. Never share it!",
            // mfaSecondFactor: {
            //     sms: true,
            //     otp: false
            // },
            signInCaseSensitive: false,
            accountRecovery: AccountRecovery.EMAIL_ONLY,
            // deviceTracking: {
            //     challengeRequiredOnNewDevice: true,
            //     deviceOnlyRememberedOnUserPrompt: true
            // }
        });

        // create a user pool client for the Amplify frontend
        const userPoolFrontendClient = new UserPoolClient(this,
            `${props.amplifyAuthConfig.userPoolFrontendClientName}-${props.stage}-${props.env!.region}`, {
                userPool: cognitoUserPool
            });

        // create a user pool identity from the user pool and the frontend client defined above
        const userPoolFrontendIdentity = new IdentityPool(this,
            `${props.amplifyAuthConfig.userPoolIdentityFrontendPoolName}-${props.stage}-${props.env!.region}`, {
                identityPoolName: `${props.amplifyAuthConfig.userPoolIdentityFrontendPoolName}-${props.stage}-${props.env!.region}`,
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
                authenticatedRole: new Role(this, `${props.amplifyAuthConfig.authenticatedRoleName}-${props.stage}-${props.env!.region}`, {
                    roleName: `${props.amplifyAuthConfig.authenticatedRoleName}`,
                    description: 'IAM Role to be used as an Authenticated role for the Cognito user pool identities, used by Amplify',
                    assumedBy: new FederatedPrincipal(
                        'cognito-identity.amazonaws.com',
                        {
                            "StringEquals": {
                                // this identity pool id has to be hardcoded because it cannot be retrieved until after it's created
                                "cognito-identity.amazonaws.com:aud": `us-west-2:977729e5-e535-4677-9dba-7bd7ba3e5a3a`
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
                unauthenticatedRole: new Role(this, `${props.amplifyAuthConfig.unauthenticatedRoleName}-${props.stage}-${props.env!.region}`, {
                    roleName: `${props.amplifyAuthConfig.unauthenticatedRoleName}`,
                    description: 'IAM Role to be used as an Unauthenticated role for the Cognito user pool identities, used by Amplify',
                    assumedBy: new FederatedPrincipal(
                        'cognito-identity.amazonaws.com',
                        {
                            "StringEquals": {
                                // this identity pool id has to be hardcoded because it cannot be retrieved until after it's created
                                "cognito-identity.amazonaws.com:aud": `us-west-2:977729e5-e535-4677-9dba-7bd7ba3e5a3a`
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

        // populates the outputs that the parent stack has access to (just so we don't output these twice from parent and child stacks)
        this.outputs = [props.env!.region!, userPoolFrontendIdentity.identityPoolId,
            cognitoUserPool.userPoolId, userPoolFrontendClient.userPoolClientId];
    }
}
