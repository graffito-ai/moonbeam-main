import {aws_appsync, aws_lambda, aws_lambda_nodejs, CfnOutput, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {BlockPublicAccess, Bucket, BucketAccessControl, HttpMethods} from "aws-cdk-lib/aws-s3";
import path from "path";
import {
    AllowedMethods,
    CacheCookieBehavior,
    CachedMethods,
    CacheHeaderBehavior,
    CachePolicy,
    CacheQueryStringBehavior,
    Distribution,
    KeyGroup,
    OriginAccessIdentity,
    PublicKey,
    ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the AppSync/Lambda storage resolver stack, used by Amplify.
 */
export class StorageResolverStack extends Stack {

    /**
     * Constructor for the AppSync/Lambda storage resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param authenticatedRole authenticated role to be passed in, used by Amplify
     * @param unauthenticatedRole unauthenticated role to be passed in, used by Amplify
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, authenticatedRole: Role, unauthenticatedRole: Role,
                props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'storageConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // main Amplify bucket, used for the application, which is not publicly readable, and is configured to work with Cognito and CloudFront, based on certain permissions.
        const mainFilesBucketName = `${props.storageConfig.mainFilesBucketName}-${props.stage}-${props.env!.region}`;
        const mainFilesBucket = new Bucket(this, `${mainFilesBucketName}`, {
            bucketName: `${mainFilesBucketName}`,
            versioned: true,
            accessControl: BucketAccessControl.PRIVATE,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            /**
             * this is for enabling Storage through Amplify. We also need to add the appropriate permissions in the Auth and Un-Auth roles from
             * @link https://docs.amplify.aws/lib/storage/getting-started/q/platform/react-native/#using-amazon-s3
             */
            cors: [
                {
                    allowedHeaders: ["*"],
                    allowedMethods: [
                        HttpMethods.GET,
                        HttpMethods.HEAD,
                        HttpMethods.PUT,
                        HttpMethods.POST,
                        HttpMethods.DELETE
                    ],
                    allowedOrigins: ["*"],
                    exposedHeaders: [
                        "x-amz-server-side-encryption",
                        "x-amz-request-id",
                        "x-amz-id-2",
                        "ETag"
                    ],
                    maxAge: 3000
                }
            ]
        });

        // create the identity used to access the bucket through CloudFront, and grant it read Access through the bucket
        const mainFilesBucketAccessIdentity = new OriginAccessIdentity(this, `${props.storageConfig.mainFilesCloudFrontAccessIdentityName}-${props.stage}-${props.env!.region}`, {
            comment: `An access identity, used to access the files in the ${props.storageConfig.mainFilesBucketName}-${props.stage}-${props.env!.region} bucket, by CloudFront`
        });
        mainFilesBucket.grantRead(mainFilesBucketAccessIdentity);

        /**
         * create the key group, to be used when signing URL requests for the CloudFront distribution.
         * The private key is stored in Secrets Manager, and it will be used in order to sign URLs when retrieving objects from storage.
         */
        const mainFilesBucketPublicKey = new PublicKey(this, `${props.storageConfig.mainFilesCloudFrontTrustedPublicKeyName}-${props.stage}-${props.env!.region}`, {
            publicKeyName: `${props.storageConfig!.mainFilesCloudFrontTrustedPublicKeyName}-${props.stage}-${props.env!.region}`,
            encodedKey: '-----BEGIN PUBLIC KEY-----\n' +
                'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsRsGBlh0F0b43JAmP3Xq\n' +
                'BoJnchRrIVxnDZyuW6l3YdIqmrtvLRSyubQvBsL19HPIDGoakaDBleZPdSoytmOk\n' +
                '82FuhI3TpN1uXyGpf7sg7GqgazLDpWLu26hrAYxep2LMqIyHkooS/ako536lXzSr\n' +
                '4bcshw8gAJjcFkYHauEcK39pOr2xmUKaMPfLY6mu4U7R9QOK1Vxa0XwakPbJKLcH\n' +
                '6MsSxGXwarttasf+AC52vpBONCuB25lyAU/qerG0gCc6dBa3PFWS7xx0nkR0HfCf\n' +
                'arC+ChSRC6O7KluWJKmBWCRZqUqYs6ng5Q5PFnG3a2A19ZXk3b4IwGz84Qs6Fpu3\n' +
                'JwIDAQAB\n' +
                '-----END PUBLIC KEY-----'
        });
        const mainFilesBucketTrustedKeyGroup = new KeyGroup(this, `${props.storageConfig.mainFilesCloudFrontTrustedKeyGroupName}-${props.stage}-${props.env!.region}`, {
            items: [mainFilesBucketPublicKey]
        });

        // create the CloudFront distribution, to be linked with the main S3 bucket, used for storage.
        const mainCloudFrontDistribution = new Distribution(this, `${props.storageConfig.mainFilesCloudFrontDistributionName}-${props.stage}-${props.env!.region}`, {
            defaultBehavior: {
                origin: new S3Origin(mainFilesBucket, {
                    originAccessIdentity: mainFilesBucketAccessIdentity
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
                cachedMethods: CachedMethods.CACHE_GET_HEAD,
                cachePolicy: new CachePolicy(this, `${props.storageConfig.mainFilesCloudFrontCachePolicyName}-${props.stage}-${props.env!.region}`, {
                    cachePolicyName: `${props.storageConfig.mainFilesCloudFrontCachePolicyName}-${props.stage}-${props.env!.region}`,
                    comment: `A cache policy, used to access the files in the ${props.storageConfig.mainFilesBucketName}-${props.stage}-${props.env!.region} bucket, by CloudFront`,
                    defaultTtl: Duration.hours(24),
                    maxTtl: Duration.hours(24),
                    minTtl: Duration.seconds(1),
                    cookieBehavior: CacheCookieBehavior.all(),
                    headerBehavior: CacheHeaderBehavior.none(),
                    queryStringBehavior: CacheQueryStringBehavior.all(),
                    enableAcceptEncodingBrotli: true,
                    enableAcceptEncodingGzip: true
                }),
                trustedKeyGroups: [mainFilesBucketTrustedKeyGroup]
            },
        });

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const storageLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.storageConfig.storageFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.storageConfig.storageFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-storage-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            memorySize: 512,
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            },
            initialPolicy: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "s3:GetObject",
                        "s3:PutObject",
                        "s3:DeleteObject"
                    ],
                    resources: [
                        `arn:aws:s3:::${mainFilesBucketName}/public/*`,
                        `arn:aws:s3:::${mainFilesBucketName}/protected/` + '${cognito-identity.amazonaws.com:sub}/*',
                        `arn:aws:s3:::${mainFilesBucketName}/private/` + '${cognito-identity.amazonaws.com:sub}/*'
                    ]
                }),
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "s3:PutObject"
                    ],
                    resources: [
                        `arn:aws:s3:::${mainFilesBucketName}/uploads/*`
                    ],
                }),
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "s3:GetObject"
                    ],
                    resources: [
                        `arn:aws:s3:::${mainFilesBucketName}/protected/*`
                    ],
                }),
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "s3:ListBucket"
                    ],
                    resources: [
                        `arn:aws:s3:::${mainFilesBucketName}`
                    ],
                    conditions: {
                        "StringLike": {
                            "s3:prefix": [
                                "public/",
                                "public/*",
                                "protected/",
                                "protected/*",
                                'private/' + '${cognito-identity.amazonaws.com:sub}/',
                                'private/' + '${cognito-identity.amazonaws.com:sub}/*',

                            ]
                        }
                    }
                }),
                // this policy enables the Lambda resolver to retrieve the private key from Secrets Manager
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "secretsmanager:GetSecretValue"
                    ],
                    resources: [
                        "arn:aws:secretsmanager:us-west-2:963863720257:secret:main-files-cloudfront-pair-dev-us-west-2-1ve4pZ" // this ARN is retrieved post secret creation
                    ]
                })
            ]
        });

        // Note that the following policy statements need to be added to the Amplify created roles, after their creation
        // add the appropriate storage policies, to the auth role, used by Amplify
        authenticatedRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            resources: [
                `arn:aws:s3:::${mainFilesBucketName}/public/*`,
                `arn:aws:s3:::${mainFilesBucketName}/protected/` + '${cognito-identity.amazonaws.com:sub}/*',
                `arn:aws:s3:::${mainFilesBucketName}/private/` + '${cognito-identity.amazonaws.com:sub}/*'
            ]
        }));
        authenticatedRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:PutObject"
            ],
            resources: [
                `arn:aws:s3:::${mainFilesBucketName}/uploads/*`
            ]
        }));
        authenticatedRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:GetObject"
            ],
            resources: [
                `arn:aws:s3:::${mainFilesBucketName}/protected/*`
            ],
        }));
        authenticatedRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:ListBucket"
            ],
            resources: [
                `arn:aws:s3:::${mainFilesBucketName}`
            ],
            conditions: {
                "StringLike": {
                    "s3:prefix": [
                        "public/",
                        "public/*",
                        "protected/",
                        "protected/*",
                        'private/' + '${cognito-identity.amazonaws.com:sub}/',
                        'private/' + '${cognito-identity.amazonaws.com:sub}/*'
                    ]
                }
            }
        }));
        // add the appropriate storage policies, to the unauth role, used by Amplify
        unauthenticatedRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            resources: [
                `arn:aws:s3:::${mainFilesBucketName}/public/*`
            ]
        }));
        unauthenticatedRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:PutObject"
            ],
            resources: [
                `arn:aws:s3:::${mainFilesBucketName}/uploads/*`
            ]
        }));
        unauthenticatedRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:GetObject"
            ],
            resources: [
                `arn:aws:s3:::${mainFilesBucketName}/protected/*`
            ],
        }));
        unauthenticatedRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:ListBucket"
            ],
            resources: [
                `arn:aws:s3:::${mainFilesBucketName}`
            ],
            conditions: {
                "StringLike": {
                    "s3:prefix": [
                        "public/",
                        "public/*",
                        "protected/",
                        "protected/*"
                    ]
                }
            }
        }));

        // retrieve the GraphQL API created by the AppSync stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const storageLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.storageConfig.storageFunctionName}-datasource-${props.stage}-${props.env!.region}`, storageLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        storageLambdaDataSource.createResolver(`${props.storageConfig.getResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.storageConfig.getResolverName}`
        });

        // Create an environment variable that we will use in the function code
        storageLambda.addEnvironment(`${Constants.StorageConstants.MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION}`, mainCloudFrontDistribution.domainName);
        storageLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        storageLambda.addEnvironment(`${Constants.StorageConstants.MOONBEAM_MAIN_FILES_KEY_PAIR_ID}`, mainFilesBucketPublicKey.publicKeyId);

        // creates the Cfn Outputs, to be added to the resulting file, which will be used by the Amplify frontend
        new CfnOutput(this, Constants.StorageConstants.AWS_S3_BUCKET_REGION, {
            exportName: Constants.StorageConstants.AWS_S3_BUCKET_REGION.replaceAll('_', '-'),
            value: props.env!.region!
        });
        new CfnOutput(this, Constants.StorageConstants.AWS_S3_BUCKET, {
            exportName: Constants.StorageConstants.AWS_S3_BUCKET.replaceAll('_', '-'),
            value: mainFilesBucket.bucketName
        });
    }
}
