import { aws_lambda, aws_lambda_nodejs, aws_sqs, Duration, Stack, StackProps } from "aws-cdk-lib";
import { StageConfiguration } from "../models/StageConfiguration";
import { Construct } from "constructs";
import path from "path";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Constants, Stages } from "@moonbeam/moonbeam-models";
// import {SqsSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets'

export class MilitaryDocumentVerificationStack extends Stack {

    // Consumer lambda for team 2: Will get document and ID from consumer queue 
    readonly militaryDocumentVerificationConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    readonly militaryDocumentVerificationProcessingQueue: aws_sqs.Queue;

    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'militaryDocumentVerificationConfig'>) {
        super(scope, id, props);

        // Consumer lambda for team 2.
        this.militaryDocumentVerificationConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-military-document-verification-consumer-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(50),
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });

        // Give the consumer lambda access to api secrets.
        this.militaryDocumentVerificationConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:moonbeam-internal-secret-pair-dev-us-west-2-vgMpp2"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:moonbeam-internal-secret-pair-prod-us-west-2-9xP6tj"] : []
                ]
            })
        );

        // Given the consumer lambda access to mutations and queries.
        this.militaryDocumentVerificationConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/*"] : []
                ]
            })
        );

        // Queue that follows the SNS topic.
        this.militaryDocumentVerificationProcessingQueue = new aws_sqs.Queue(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {

        });

        // Get files bucket name for the event bridge.
        const mainFilesBucketName = `${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${props.stage}-${props.env!.region}`;

        // Create the S3 event bridge.
        const s3EventRule = new events.Rule(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingEventRule}`, {
            eventPattern: {
                "source": ["aws.s3"],
                "detailType": ["Object Created"],
                "detail": {
                    "bucket": {
                        "name": [mainFilesBucketName]
                    }
                }
            }
        });

        // Add the consumer lambda function as a target for this event.
        s3EventRule.addTarget(new targets.SqsQueue(this.militaryDocumentVerificationProcessingQueue));
    }

}