import {App} from 'aws-cdk-lib';
import {INFRA_CONFIG} from "./configuration/Configuration";
import {StageUtils} from "./utils/StageUtils";

// creating the CDK app to be used for our infrastructure
const app = new App();

// retrieves the stage/environment and region from App context (CLI arguments)
const stage = app.node.tryGetContext("stage") && app.node.tryGetContext("stage")!.toString();
const region = app.node.tryGetContext("region") && app.node.tryGetContext("region")!.toString();
// throws an error if the App context does not have the right arguments in it
if (!stage || !region) {
    throw new Error(`Either stage, or region arguments not passed in to CDK app, as \"-c stage={STAGE} -c region={REGION}\"`);
}

// initializing a new instance of the StageUtils class, used to set up the stages
const stageUtils = new StageUtils(app, INFRA_CONFIG, `${stage}-${region}`);
// sets up the stages
stageUtils.setupStages();

// synthesizes the CDK app
app.synth();
