import {aws_amplify, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {Stages} from "../models/enum/Stages";

/**
 * File used to define the Amplify stack, used to deploy all
 * Amplify related functionality.
 */
export class AmplifyStack extends Stack {
    /**
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor (scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage'>) {
        super(scope, id, props);

        // first create the actual Amplify App - only for one stage (since we only want to create this once)
        props.stage == Stages.DEV && new aws_amplify.CfnApp(this, `moonbeam-application`, {
            name: 'moonbeam-application',
            iamServiceRole: 'moonbeam-application-role'
        });
    }
}
