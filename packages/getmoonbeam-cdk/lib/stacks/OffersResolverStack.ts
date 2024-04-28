import {aws_appsync, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import { Alias } from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the Offers resolver stack, used by Amplify, as well
 * as any other dependent services.
 */
export class OffersResolverStack extends Stack {

    /**
     * Constructor for the Offers resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'offersConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const offersLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.offersConfig.offersFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.offersConfig.offersFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-offers-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect queries and filtering calls to take longer
            timeout: Duration.seconds(40),
            memorySize: 512,
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });
        new Alias(this, `${props.offersConfig.offersFunctionName}-current-version-alias`, {
            aliasName: `${props.offersConfig.offersFunctionName}-current-version-alias`,
            version: offersLambda.currentVersion,
            provisionedConcurrentExecutions: 3
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const offersLambdaSource = graphqlApi.addLambdaDataSource(`${props.offersConfig.offersFunctionName}-datasource-${props.stage}-${props.env!.region}`, offersLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        offersLambdaSource.createResolver(`${props.offersConfig.searchOffersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.offersConfig.searchOffersResolverName}`,
            /**
             * Per-resolver caching enabled here
             *
             * https://docs.aws.amazon.com/appsync/latest/devguide/enabling-caching.html
             */
            cachingConfig: {
                ttl: Duration.seconds(3600) // 1 hour caching enabled
            }
        });
        offersLambdaSource.createResolver(`${props.offersConfig.getOffersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.offersConfig.getOffersResolverName}`,
            /**
             * Per-resolver caching enabled here
             *
             * https://docs.aws.amazon.com/appsync/latest/devguide/enabling-caching.html
             */
            cachingConfig: {
                ttl: Duration.seconds(3600) // 1 hour caching enabled
            }
        });
        offersLambdaSource.createResolver(`${props.offersConfig.getFidelisPartnersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.offersConfig.getFidelisPartnersResolverName}`,
            /**
             * Per-resolver caching enabled here
             *
             * https://docs.aws.amazon.com/appsync/latest/devguide/enabling-caching.html
             */
            cachingConfig: {
                ttl: Duration.seconds(3600) // 1 hour caching enabled
            }
        });
        offersLambdaSource.createResolver(`${props.offersConfig.getPremierOffersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.offersConfig.getPremierOffersResolverName}`,
            /**
             * Per-resolver caching enabled here
             *
             * https://docs.aws.amazon.com/appsync/latest/devguide/enabling-caching.html
             */
            cachingConfig: {
                ttl: Duration.seconds(3600) // 1 hour caching enabled
            }
        });
        offersLambdaSource.createResolver(`${props.offersConfig.getSeasonalOffersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.offersConfig.getSeasonalOffersResolverName}`,
            /**
             * Per-resolver caching enabled here
             *
             * https://docs.aws.amazon.com/appsync/latest/devguide/enabling-caching.html
             */
            cachingConfig: {
                ttl: Duration.seconds(3600) // 1 hour caching enabled
            }
        });

        // enable the Lambda function the retrieval of the Olive API secrets
        offersLambda.addToRolePolicy(
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

        // Create environment variables that we will use in the function code
        offersLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
