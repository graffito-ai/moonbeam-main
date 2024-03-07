import {aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Rule, Schedule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";
import * as events from "aws-cdk-lib/aws-events";

/**
 * File used to define the Scripts resolver stack, used to
 * triggers various internal scripts.
 */
export class ScriptsResolverStack extends Stack {

    /**
     * Constructor for the ScriptsResolverStack stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'scriptsConfig'>) {
        super(scope, id, props);

        // create a new Lambda function to be used with the for scripts initiation purposes
        const scriptsLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.scriptsConfig.scriptsFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.scriptsConfig.scriptsFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-scripts-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(900),
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });
        /**
         * create a CRON expression trigger that will enable running the scripts lambda to trigger
         * the card expiration back-fill script to run on a schedule
         */
        new Rule(this, `${props.scriptsConfig.cardExpirationBackFillCronRuleName}-${props.stage}-${props.env!.region}`, {
            ruleName: `${props.scriptsConfig.cardExpirationBackFillCronRuleName}-${props.stage}-${props.env!.region}`,
            description: "Schedule the Scripts Trigger Lambda which initiates the card expiration back-fill cron rule.",
            // set the CRON timezone to run the card expiration back-fill once, on 03/07/2024 at 02:57 PM UTC, 19:57 PM MST
            schedule: Schedule.cron({
                month: '03',
                day: '07',
                year: '2024',
                minute: '57',
                hour: '02'
            }),
            targets: [new LambdaFunction(scriptsLambda, {
                event: events.RuleTargetInput.fromObject({
                    ["detail-type"]: 'Scheduled Event',
                    detail: {
                        eventType: 'CardExpirationBackFillScriptReminderEvent'
                    }
                })
            })]
        });

        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        scriptsLambda.addToRolePolicy(
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
        // enable the Lambda function the retrieval of the Olive API secrets
        scriptsLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:olive-secret-pair-dev-us-west-2-OTgCOk"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:olive-secret-pair-prod-us-west-2-gIvRt8"] : []
                ]
            })
        );
        // enable the Lambda function to access the AppSync mutations and queries
        scriptsLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/*"] : []
                ]
            })
        );
        scriptsLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/*"] : []
                ]
            })
        );

        // Create environment variables that we will use in Lambda scripts function code
        scriptsLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
