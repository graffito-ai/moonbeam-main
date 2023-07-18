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
import {ApiKeySourceType, EndpointType, LogGroupLogDestination, Period} from "aws-cdk-lib/aws-apigateway";
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
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'cardLinkingServiceConfig'>
        & { transactionsProducerLambda: aws_lambda_nodejs.NodejsFunction }) {
        super(scope, id, props);

        // create the API Gateway API service
        const cardLinkingServiceAPI = new aws_apigateway.RestApi(this, `${props.cardLinkingServiceConfig.cardLinkingServiceAPIName}-${props.stage}-${props.env!.region}`, {
            restApiName: `${props.cardLinkingServiceConfig.cardLinkingServiceAPIName}-${props.stage}-${props.env!.region}`,
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
                    .fromCertificateArn(this, `${props.cardLinkingServiceConfig.cardLinkingServiceAPIName}-certificate-${props.stage}-${props.env!.region}`,
                        props.stage === Stages.DEV
                            ? `arn:aws:acm:us-east-1:963863720257:certificate/2c3b8814-e4a4-46ea-80a5-a5ee3be69615`
                            : props.stage === Stages.PROD
                                ? `arn:aws:acm:us-east-1:251312580862:certificate/bea62d97-9fdd-42f2-98dc-a65681e62c68`
                                : ``)
            },
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(new LogGroup(this, `${props.cardLinkingServiceConfig.apiDeploymentGroupName}-${props.stage}-${props.env!.region}`, {
                    logGroupName: `${props.cardLinkingServiceConfig.apiDeploymentGroupName}-${props.stage}-${props.env!.region}`,
                    retention: RetentionDays.THREE_MONTHS,
                    removalPolicy: RemovalPolicy.DESTROY
                }))
            },
            retainDeployments: false
        });

        // retrieve the value for the API Key, created specifically for Olive from Secrets Manager
        const oliveSecretPair = aws_secretsmanager.Secret.fromSecretNameV2(this, `${Constants.AWSPairConstants.OLIVE_SECRET_NAME}-id-${props.stage}-${props.env!.region}`,
            `${Constants.AWSPairConstants.OLIVE_SECRET_NAME}-${props.stage}-${props.env!.region}`);
        const keyValue = oliveSecretPair.secretValueFromJson(`${Constants.AWSPairConstants.OLIVE_WEBHOOK_KEY}`).unsafeUnwrap();

        /**
         * create an API Key, to be specifically shared with Olive, so that they can use any of the REST methods configured below,
         * and adds it to the API.
         *
         * ToDo: in the future we will need to make a AWS::SecretsManager::Secret and a AWS::SecretsManager::RotationSchedule.
         *       The RotationSchedule will let us use a lambda to automatically rotate the ApiKey and store it in the Secret.
         *       For now we will rotate this key manually
         */
        const oliveAPIKey = new aws_apigateway.ApiKey(this, `${props.cardLinkingServiceConfig.oliveSharedAPIKeyName}-${props.stage}-${props.env!.region}`, {
            apiKeyName: `${props.cardLinkingServiceConfig.oliveSharedAPIKeyName}-${props.stage}-${props.env!.region}`,
            description: `API Key to be shared with Olive, in order for them to access the endpoints configured below, for webhook purposes.`,
            value: keyValue,
            enabled: true
        });
        // add the API Key to the API Gateway Service, through a Usage Plan
        const oliveUsagePlan = new aws_apigateway.UsagePlan(this, `${props.cardLinkingServiceConfig.oliveUsagePlan}-${props.stage}-${props.env!.region}`, {
            name: `${props.cardLinkingServiceConfig.oliveUsagePlan}-${props.stage}-${props.env!.region}`,
            description: `Usage plan for the API Key to be shared with Olive`,
            apiStages: [{api: cardLinkingServiceAPI, stage: cardLinkingServiceAPI.deploymentStage}],
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

        // create a new API Integration for transactions
        const postTransactionsIntegration = new aws_apigateway.LambdaIntegration(props.transactionsProducerLambda, {
            allowTestInvoke: true,
            timeout: Duration.seconds(29)
        });

        /**
         * create a new POST method for the API/Lambda integration, used for posting transaction.
         * This method will be secured via an API key
         */
        cardLinkingServiceAPI.root.addResource(`${props.cardLinkingServiceConfig.transactionsAcknowledgmentMethodName}`).addMethod("POST", postTransactionsIntegration, {
            apiKeyRequired: true,
            operationName: props.cardLinkingServiceConfig.transactionsAcknowledgmentMethodName
        });
    }
}
