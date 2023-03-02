import {Stages} from "./enum/Stages";
import {AWSAmplifyConfiguration, SESConfiguration} from "./ServiceConfiguration";

/**
 * File used to define the configuration for a stage
 */
export interface StageConfiguration {
    readonly stage: Stages;
    readonly awsAccountId: string;
    readonly amplifyConfig?: AWSAmplifyConfiguration;
    readonly sesConfig?: SESConfiguration;
    readonly environmentVariables: Map<string, string>;
}
