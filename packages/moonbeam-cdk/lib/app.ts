import {App} from 'aws-cdk-lib';
import {INFRA_CONFIG} from "./configuration/Configuration";
import {StageUtils} from "./utils/StageUtils";

const app = new App();
const stageUtils = new StageUtils(app, INFRA_CONFIG);
stageUtils.setupStages();

app.synth();
