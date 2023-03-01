import {InfrastructureConfiguration} from "../models/InfrastructureConfiguration";
import {App, Environment} from "aws-cdk-lib";
import {AmplifyStack} from "../stacks/AmplifyStack";

/**
 * File used as a utility class, for defining and setting up all infrastructure-based stages
 */
export class StageUtils {
    // infrastructure configuration to be used for defining and setting up all stages
    private readonly configuration: InfrastructureConfiguration;

    // CDK app, passed in
    private readonly app: App;

    /**
     * Utility constructor
     *
     * @param app cdk application to be passed in
     * @param configuration infrastructure configuration to be passed in
     */
    constructor (app: App, configuration: InfrastructureConfiguration) {
        this.app = app;
        this.configuration = configuration;
    }

    /**
     * Function used to set up all the stages, depending on the infrastructure configuration passed in
     */
    setupStages = () => {
        // loop through all stages
        for (const stageKey in this.configuration.stages) {
            const stageConfiguration = this.configuration.stages[stageKey];

            // define the AWS Environment that the stacks will be deployed in
            const stageEnv: Environment = {
                account: stageConfiguration.awsAccountId,
                region: stageKey.split('-', 1)[1]
            }

            // create the Amplify stack for all stages & add it to the CDK App
            new AmplifyStack(this.app, `amplify-${stageKey}`, {
                stackName: `amplify-${stageKey}`,
                description: 'This stack will contain all the Amplify resources needed for our Amplify Application',
                env: stageEnv,
                stage: stageConfiguration.stage,
                environmentVariables: stageConfiguration.environmentVariables
            });
        }
    };
}
