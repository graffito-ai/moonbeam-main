import {
    aws_apigateway,
    aws_certificatemanager,
    aws_lambda_nodejs,
    aws_secretsmanager,
    Duration,
    RemovalPolicy,
    Stack,
    StackProps
} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {ApiKeySourceType, EndpointType, LogGroupLogDestination, Method, Period} from "aws-cdk-lib/aws-apigateway";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {Constants, Stages} from "@moonbeam/moonbeam-models";

/**
 * File used to define the APIGatewayServiceStack stack, used to create various API Gateway based services.
 *
 * 1) This service will house various REST endpoints, which have their logic implemented in a serverless
 * manner through Lambdas, revolved around card linking. It will handle incoming requests for Olive-based
 * asynchronous events, such as: transactions, offers, reimbursements/credits, etc.
 */
export class APIGatewayServiceStack extends Stack {

    /**
     * Constructor for the APIGatewayServiceStack stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'apiGatewayServiceConfig'>
        & {
        transactionsProducerLambda: aws_lambda_nodejs.NodejsFunction,
        updatedTransactionsProducerLambda: aws_lambda_nodejs.NodejsFunction,
        militaryVerificationNotificationProducerLambda: aws_lambda_nodejs.NodejsFunction
    }) {
        super(scope, id, props);

        // create the API Gateway API service
        const cardLinkingServiceAPI = new aws_apigateway.RestApi(this, `${props.apiGatewayServiceConfig.cardLinkingServiceAPIName}-${props.stage}-${props.env!.region}`, {
            restApiName: `${props.apiGatewayServiceConfig.cardLinkingServiceAPIName}-${props.stage}-${props.env!.region}`,
            description: "The Card Linking Service used for Webhook purposes.",
            deploy: true,
            apiKeySourceType: ApiKeySourceType.HEADER,
            cloudWatchRole: true,
            domainName: {
                // our domain for incoming requests, to point to an Edge Cloudfront endpoint, that will then point to the actual API Gateway distribution endpoint
                domainName:
                    props.stage === Stages.DEV
                        ? 'api-dev.moonbeam.vet'
                        : props.stage === Stages.PROD
                            ? 'api.moonbeam.vet'
                            : '',
                endpointType: EndpointType.EDGE,
                // ARN retrieved after its creation, has to be in us-east-1
                certificate: aws_certificatemanager.Certificate
                    .fromCertificateArn(this, `${props.apiGatewayServiceConfig.cardLinkingServiceAPIName}-certificate-${props.stage}-${props.env!.region}`,
                        props.stage === Stages.DEV
                            ? `arn:aws:acm:us-east-1:963863720257:certificate/2c3b8814-e4a4-46ea-80a5-a5ee3be69615`
                            : props.stage === Stages.PROD
                                ? `arn:aws:acm:us-east-1:251312580862:certificate/bea62d97-9fdd-42f2-98dc-a65681e62c68`
                                : ``)
            },
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(new LogGroup(this, `${props.apiGatewayServiceConfig.apiDeploymentGroupName}-${props.stage}-${props.env!.region}`, {
                    logGroupName: `${props.apiGatewayServiceConfig.apiDeploymentGroupName}-${props.stage}-${props.env!.region}`,
                    retention: RetentionDays.THREE_MONTHS,
                    removalPolicy: RemovalPolicy.DESTROY
                }))
            },
            retainDeployments: false
        });

        // create a new API Integration for transactions
        const postTransactionsIntegration = new aws_apigateway.LambdaIntegration(props.transactionsProducerLambda, {
            allowTestInvoke: true,
            timeout: Duration.seconds(29)
        });
        /**
         * create a new POST method for the API/Lambda integration, used for posting transactions.
         * This method will be secured via an API key.
         */
        const transactionAcknowledgmentMethod = new Method(this, `${props.apiGatewayServiceConfig.transactionsAcknowledgmentMethodName}-${props.stage}-${props.env!.region}`, {
            httpMethod: "POST",
            resource: cardLinkingServiceAPI.root.addResource(`${props.apiGatewayServiceConfig.transactionsAcknowledgmentMethodName}`),
            integration: postTransactionsIntegration,
            options: {
                apiKeyRequired: true,
                operationName: props.apiGatewayServiceConfig.transactionsAcknowledgmentMethodName
            }
        });

        // create a new API Integration for updated transactions
        const postUpdatedTransactionsIntegration = new aws_apigateway.LambdaIntegration(props.updatedTransactionsProducerLambda, {
            allowTestInvoke: true,
            timeout: Duration.seconds(29)
        });
        /**
         * create a new POST method for the API/Lambda integration, used for posting updated transactions.
         * This method will be secured via an API key.
         */
        const updatedTransactionAcknowledgmentMethod = new Method(this, `${props.apiGatewayServiceConfig.updatedTransactionsAcknowledgmentMethodName}-${props.stage}-${props.env!.region}`, {
            httpMethod: "POST",
            resource: cardLinkingServiceAPI.root.addResource(`${props.apiGatewayServiceConfig.updatedTransactionsAcknowledgmentMethodName}`),
            integration: postUpdatedTransactionsIntegration,
            options: {
                apiKeyRequired: true,
                operationName: props.apiGatewayServiceConfig.updatedTransactionsAcknowledgmentMethodName
            }
        });

        // create a new API Integration for military verification updates/notifications
        const postMilitaryVerificationUpdatesIntegration = new aws_apigateway.LambdaIntegration(props.militaryVerificationNotificationProducerLambda, {
            allowTestInvoke: true,
            timeout: Duration.seconds(29)
        });
        /**
         * create a new POST method for the API/Lambda integration, used for posting military verification updates/notifications.
         * This method will be secured via an API key
         */
        const militaryVerificationUpdatesAcknowledgmentMethod = new Method(this, `${props.apiGatewayServiceConfig.militaryVerificationUpdatesAcknowledgmentMethodName}-${props.stage}-${props.env!.region}`, {
            httpMethod: "POST",
            resource: cardLinkingServiceAPI.root.addResource(`${props.apiGatewayServiceConfig.militaryVerificationUpdatesAcknowledgmentMethodName}`),
            integration: postMilitaryVerificationUpdatesIntegration,
            options: {
                apiKeyRequired: true,
                operationName: props.apiGatewayServiceConfig.militaryVerificationUpdatesAcknowledgmentMethodName
            }
        });

        // retrieve the value for the API Key, created specifically for Olive from Secrets Manager
        const oliveSecretPair = aws_secretsmanager.Secret.fromSecretNameV2(this, `${Constants.AWSPairConstants.OLIVE_SECRET_NAME}-id-${props.stage}-${props.env!.region}`,
            `${Constants.AWSPairConstants.OLIVE_SECRET_NAME}-${props.stage}-${props.env!.region}`);
        const oliveKeyValue = oliveSecretPair.secretValueFromJson(`${Constants.AWSPairConstants.OLIVE_WEBHOOK_KEY}`).unsafeUnwrap();

        // retrieve the value for the API Key, created specifically for internal user from Secrets Manager
        const internalSecretPair = aws_secretsmanager.Secret.fromSecretNameV2(this, `${Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME}-id-${props.stage}-${props.env!.region}`,
            `${Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME}-${props.stage}-${props.env!.region}`);
        const internalKeyValue = internalSecretPair.secretValueFromJson(`${Constants.AWSPairConstants.MOONBEAM_INTERNAL_REST_API_KEY}`).unsafeUnwrap();

        /**
         * create an API Key, to be specifically shared with Olive, so that they can use any of the REST methods configured below,
         * and add it to the API.
         *
         * ToDo: in the future we will need to make a AWS::SecretsManager::Secret and a AWS::SecretsManager::RotationSchedule.
         *       The RotationSchedule will let us use a lambda to automatically rotate the ApiKey and store it in the Secret.
         *       For now we will rotate this key manually
         */
        const oliveAPIKey = new aws_apigateway.ApiKey(this, `${props.apiGatewayServiceConfig.oliveSharedAPIKeyName}-${props.stage}-${props.env!.region}`, {
            apiKeyName: `${props.apiGatewayServiceConfig.oliveSharedAPIKeyName}-${props.stage}-${props.env!.region}`,
            description: `API Key to be shared with Olive, in order for them to access the endpoints configured below, for webhook purposes.`,
            value: oliveKeyValue,
            enabled: true
        });
        // add the API Key to the API Gateway Service, through a Usage Plan
        const oliveUsagePlan = new aws_apigateway.UsagePlan(this, `${props.apiGatewayServiceConfig.oliveUsagePlan}-${props.stage}-${props.env!.region}`, {
            name: `${props.apiGatewayServiceConfig.oliveUsagePlan}-${props.stage}-${props.env!.region}`,
            description: `Usage plan for the API Key to be shared with Olive`,
            apiStages: [
                {
                    api: cardLinkingServiceAPI,
                    stage: cardLinkingServiceAPI.deploymentStage,
                    throttle: [
                        /**
                         * we want to throttle any methods other than the ones related to transactions,
                         * so the key associated with this plan, cannot be used for anything else, since
                         * it is shared with Olive.
                         *
                         * ToDo: in the future if we create new methods we will need to configure them here
                         *       individually.
                         */
                        {
                            method: transactionAcknowledgmentMethod,
                            throttle: {
                                burstLimit: 5000,
                                rateLimit: 10000
                            }
                        },
                        {
                            method: updatedTransactionAcknowledgmentMethod,
                            throttle: {
                                burstLimit: 5000,
                                rateLimit: 10000
                            }
                        },
                        {
                            method: militaryVerificationUpdatesAcknowledgmentMethod,
                            throttle: {
                                burstLimit: 5000,
                                rateLimit: 10000
                            }
                        }
                    ]
                }
            ],
            throttle: {
                burstLimit: 5000,
                rateLimit: 10000
            },
            quota: {
                limit: 50000000,
                period: Period.MONTH
            }
        });
        oliveUsagePlan.addApiKey(oliveAPIKey);

        /**
         * create an API Key, to be specifically shared internally, so that they we can use any of the REST methods configured below,
         * and add it to the API.
         *
         * ToDo: in the future we will need to make a AWS::SecretsManager::Secret and a AWS::SecretsManager::RotationSchedule.
         *       The RotationSchedule will let us use a lambda to automatically rotate the ApiKey and store it in the Secret.
         *       For now we will rotate this key manually
         */
        const internalAPIKey = new aws_apigateway.ApiKey(this, `${props.apiGatewayServiceConfig.internallySharedAPIKeyName}-${props.stage}-${props.env!.region}`, {
            apiKeyName: `${props.apiGatewayServiceConfig.internallySharedAPIKeyName}-${props.stage}-${props.env!.region}`,
            description: `API Key to be shared internally, in order for us to access the endpoints configured below, for async data transfer purposes.`,
            value: internalKeyValue,
            enabled: true
        });
        // add the API Key to the API Gateway Service, through a Usage Plan
        const internalUsagePlan = new aws_apigateway.UsagePlan(this, `${props.apiGatewayServiceConfig.internalUsagePlan}-${props.stage}-${props.env!.region}`, {
            name: `${props.apiGatewayServiceConfig.internalUsagePlan}-${props.stage}-${props.env!.region}`,
            description: `Usage plan for the API Key to be shared internally`,
            apiStages: [{api: cardLinkingServiceAPI, stage: cardLinkingServiceAPI.deploymentStage}],
            /**
             * we want to have a throttle overall for all methods, since we want the key associated with this plan,
             * to have access to every method, regardless of its purpose, given its internal use
             */
            throttle: {
                burstLimit: 5000,
                rateLimit: 10000
            },
            quota: {
                limit: 50000000,
                period: Period.MONTH
            }
        });
        internalUsagePlan.addApiKey(internalAPIKey);
    }
}
