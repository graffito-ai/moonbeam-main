import {aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

/**
 * File used to define the WebhookTransactionsLambda stack, used to create all the necessary resources
 * involved around handling incoming transactional data (Lambdas, DynamoDB tables, etc.). Eventually
 * all of these resources will be used by the CardLinkingService API, in order to build REST endpoints,
 * with their logic served by them.
 */
export class WebhookTransactionsLambdaStack extends Stack {

    // the created Lambda Function, to be used in configuring REST API Gateway endpoints in dependent stacks
    readonly webhookTransactionsLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * Constructor for the TransactionsLambda stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'webhookTransactionsConfig'>) {
        super(scope, id, props);

        // create a new Lambda function to be used with the Card Linking Webhook service for transaction purposes
        this.webhookTransactionsLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.webhookTransactionsConfig.transactionsFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.webhookTransactionsConfig.transactionsFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-webhook-transactions-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(30),
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            },
            initialPolicy: [
                // policy used to allow the retrieval of the Olive API secrets
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "secretsmanager:GetSecretValue"
                    ],
                    resources: [
                        "arn:aws:secretsmanager:us-west-2:963863720257:secret:olive-secret-pair-dev-us-west-2-OTgCOk" // this ARN is retrieved post secret creation
                    ]
                })
            ]
        });

        // ToDO: create any necessary tables where the transactions will be stored, and/or other resources accordingly
    }
}
