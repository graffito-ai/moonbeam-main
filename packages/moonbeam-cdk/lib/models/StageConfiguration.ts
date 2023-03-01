import {Stages} from "./enum/Stages";

/**
 * File used to define the configuration for a stage
 */
export interface StageConfiguration {
    readonly stage: Stages;
    readonly awsAccountId: string;
    readonly environmentVariables: Map<string, string>;
}
