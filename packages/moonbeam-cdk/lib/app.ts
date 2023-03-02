import {App} from 'aws-cdk-lib';
import {INFRA_CONFIG} from "./configuration/Configuration";
import {StageUtils} from "./utils/StageUtils";

// creating the CDK app to be used for our infrastructure
const app = new App();
// initializing a new instance of the StageUtils class, used to set-up the stages
const stageUtils = new StageUtils(app, INFRA_CONFIG);
// sets up the stages
stageUtils.setupStages();

// synthesizes the CDK app
app.synth();
