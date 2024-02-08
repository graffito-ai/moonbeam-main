import {aws_appsync, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";
import {Alias} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the Utilities resolver stack, responsible for handling
 * various types of utility-based service configurations.
 */
export class UtilitiesResolverStack extends Stack {

    /**
     * Constructor for the Utilities resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param authenticatedRole authenticated role to be passed in, used by Amplify
     * @param unauthenticatedRole unauthenticated role to be passed in, used by Amplify
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string,
                authenticatedRole: Role, unauthenticatedRole: Role,
                props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'utilitiesConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const utilitiesLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.utilitiesConfig.utilitiesFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.utilitiesConfig.utilitiesFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-utilities-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect queries and filtering calls to take longer
            timeout: Duration.seconds(20),
            memorySize: 512,
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            },
            reservedConcurrentExecutions: 10
        });
        new Alias(this, `${props.utilitiesConfig.utilitiesFunctionName}-current-version-alias`, {
            aliasName: `${props.utilitiesConfig.utilitiesFunctionName}-current-version-alias`,
            version: utilitiesLambda.currentVersion,
            provisionedConcurrentExecutions: 2
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const utilitiesLambdaSource = graphqlApi.addLambdaDataSource(`${props.utilitiesConfig.utilitiesFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            utilitiesLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        utilitiesLambdaSource.createResolver(`${props.utilitiesConfig.geoCodeAsyncResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.utilitiesConfig.geoCodeAsyncResolverName}`
        });
        utilitiesLambdaSource.createResolver(`${props.utilitiesConfig.getLocationPredictionsResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.utilitiesConfig.getLocationPredictionsResolverName}`
        });

        // enable the Lambda function the retrieval of the Google Maps APIs internal API secrets
        utilitiesLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:google-maps-internal-secret-pair-dev-us-west-2-ccUuPZ"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:google-maps-internal-secret-pair-prod-us-west-2-j2o61z"] : []
                ]
            })
        );

        // enable the auth and unauthenticated AWS Amplify role to call the specific Mutation Lambda resolver, used for retrieving Locations Predictions
        authenticatedRole.addToPrincipalPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? [`arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/fields/${props.utilitiesConfig.getLocationPredictionsResolverName}`] : [],
                    ...props.stage === Stages.PROD ? [`arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/fields/${props.utilitiesConfig.getLocationPredictionsResolverName}`] : []
                ]
            })
        );
        unauthenticatedRole.addToPrincipalPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? [`arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/fields/${props.utilitiesConfig.getLocationPredictionsResolverName}`] : [],
                    ...props.stage === Stages.PROD ? [`arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/fields/${props.utilitiesConfig.getLocationPredictionsResolverName}`] : []
                ]
            })
        );

        // Create environment variables that we will use in the function code
        utilitiesLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
