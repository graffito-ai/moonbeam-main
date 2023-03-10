import {NestedStack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {StageConfiguration} from "../models/StageConfiguration";
import path from "path";
import {AuthorizationType, GraphqlApi, SchemaFile} from "aws-cdk-lib/aws-appsync";
import {UserPool} from "aws-cdk-lib/aws-cognito";

/**
 * File used to define the stack responsible for creating the resources
 * for the AppSync API used by Amplify.
 */
export class AmplifyAppSyncStack extends NestedStack {

    /**
     * since this is a nested stack, the CfnOutputs do not accurately work. Thus, in order to take advantage of the CfnOutputs
     * and display them from the parent stack, in order to eventually write them to a file, we will store them in a variable, accessible
     * from the parent stack.
     */
    public outputs: string[];

    // the created AppSync API id, to be used in retrieving the AppSync API in dependent stacks
    public graphqlApiId: string;

    /**
     * Constructor for the app sync stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'amplifyConfig'> & {userPoolId: string}) {
        super(scope, id, props);

        // create the AppSync GraphQL API
        const appSyncApi = new GraphqlApi(this, `${props.amplifyConfig!.appSyncConfig!.graphqlApiName}-${props.stage}-${props.env!.region}`, {
            name: `${props.amplifyConfig!.appSyncConfig!.graphqlApiName}-${props.stage}-${props.env!.region}`,
            schema: SchemaFile.fromAsset(path.join(__dirname, '../../graphql/schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool: UserPool.fromUserPoolId(
                            this,
                            `${props.amplifyConfig!.amplifyAuthConfig!.userPoolName}-${props.stage}-${props.env!.region}`,
                            props.userPoolId
                        )
                    }
                }
            },
        });
        this.graphqlApiId = appSyncApi.apiId;

        // populates the outputs that the parent stack has access to (just so we don't output these twice from parent and child stacks)
        this.outputs = [props.env!.region!, appSyncApi.graphqlUrl];
    }
}
