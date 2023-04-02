import {
    aws_appsync,
    aws_lambda,
    aws_lambda_nodejs,
    aws_s3_deployment,
    Duration,
    NestedStack,
    StackProps
} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {BlockPublicAccess, Bucket, BucketAccessControl} from "aws-cdk-lib/aws-s3";
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
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Storage stack, used by Amplify.
 */
export class AmplifyStorageStack extends NestedStack {

    /**
     * Constructor for the Storage stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'amplifyConfig'> & { graphqlApiId: string }) {
        super(scope, id, props);

        /**
         * add a deployment bucket, to be used for storing various/miscellaneous, public readable files (like Plaid related ones), necessary for
         * the functioning of the application, without which, some core features would not work (like Plaid OAuth).
         */
        const deploymentBucket = new Bucket(this, `${props.amplifyConfig!.storageConfig!.deploymentBucketName}-${props.stage}-${props.env!.region}`, {
            bucketName: `${props.amplifyConfig!.storageConfig!.deploymentBucketName}-${props.stage}-${props.env!.region}`,
            versioned: false,
            accessControl: BucketAccessControl.PRIVATE // only owner has access besides certain files
        });
        // write the Oauth Plaid file to the bucket
        new aws_s3_deployment.BucketDeployment(this, 'DeployFiles', {
            sources: [aws_s3_deployment.Source.asset(path.join(__dirname,
                `../../files/plaid/${props.stage}`))],
            destinationBucket: deploymentBucket,
            accessControl: BucketAccessControl.PUBLIC_READ // public readable object
        });

        // main Amplify bucket, used for the application, which is not publicly readable, and is configured to work with Cognito and CloudFront, based on certain permissions.
        const mainFilesBucketName = `${props.amplifyConfig!.storageConfig!.mainFilesBucketName}-${props.stage}-${props.env!.region}`;
        const mainFilesBucket = new Bucket(this, `${mainFilesBucketName}`, {
            bucketName: `${mainFilesBucketName}`,
            versioned: true,
            accessControl: BucketAccessControl.PRIVATE,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL
        });

        // create the identity used to access the bucket through CloudFront, and grant it read Access through the bucket
        const mainFilesBucketAccessIdentity = new OriginAccessIdentity(this, `${props.amplifyConfig!.storageConfig!.mainFilesCloudFrontAccessIdentityName}-${props.stage}-${props.env!.region}`, {
            comment: `An access identity, used to access the files in the ${props.amplifyConfig!.storageConfig!.mainFilesBucketName}-${props.stage}-${props.env!.region} bucket, by CloudFront`
        });
        mainFilesBucket.grantRead(mainFilesBucketAccessIdentity);

        // create the key group, to be used when signing URL requests for the CloudFront distribution
        const mainFilesBucketPublicKey = new PublicKey(this, `${props.amplifyConfig!.storageConfig!.mainFilesCloudFrontTrustedPublicKeyName}-${props.stage}-${props.env!.region}`, {
            publicKeyName: `${props.amplifyConfig!.storageConfig!.mainFilesCloudFrontTrustedPublicKeyName}-${props.stage}-${props.env!.region}`,
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
        const mainFilesBucketTrustedKeyGroup = new KeyGroup(this, `${props.amplifyConfig!.storageConfig!.mainFilesCloudFrontTrustedKeyGroupName}-${props.stage}-${props.env!.region}`, {
            items: [mainFilesBucketPublicKey]
        });

        // create the CloudFront distribution, to be linked with the main S3 bucket, used for storage.
        const mainCloudFrontDistribution = new Distribution(this, `${props.amplifyConfig!.storageConfig!.mainFilesCloudFrontDistributionName}-${props.stage}-${props.env!.region}`, {
            defaultBehavior: {
                origin: new S3Origin(mainFilesBucket, {
                    originAccessIdentity: mainFilesBucketAccessIdentity
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
                cachedMethods: CachedMethods.CACHE_GET_HEAD,
                cachePolicy: new CachePolicy(this, `${props.amplifyConfig!.storageConfig!.mainFilesCloudFrontCachePolicyName}-${props.stage}-${props.env!.region}`, {
                    cachePolicyName: `${props.amplifyConfig!.storageConfig!.mainFilesCloudFrontCachePolicyName}-${props.stage}-${props.env!.region}`,
                    comment: `A cache policy, used to access the files in the ${props.amplifyConfig!.storageConfig!.mainFilesBucketName}-${props.stage}-${props.env!.region} bucket, by CloudFront`,
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
        const storageLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.amplifyConfig!.storageConfig!.storageFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.amplifyConfig!.storageConfig!.storageFunctionName}-${props.stage}-${props.env!.region}`,
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
                        `arn:aws:s3:::${mainFilesBucketName}/private/*`,
                    ]
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
                                "private/",
                                "private/*"
                            ]
                        }
                    }
                }),
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

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.amplifyConfig!.appSyncConfig!.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const storageLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.amplifyConfig!.storageConfig!.storageFunctionName}-datasource-${props.stage}-${props.env!.region}`, storageLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        storageLambdaDataSource.createResolver(`${props.amplifyConfig!.storageConfig!.storageFunctionName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.amplifyConfig!.storageConfig!.getResolverName}`
        });

        // Create an environment variable that we will use in the function code
        storageLambda.addEnvironment(`${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION}`, mainCloudFrontDistribution.domainName);
        storageLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        storageLambda.addEnvironment(`${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_KEY_PAIR_ID}`, mainFilesBucketPublicKey.publicKeyId);
    }
}
