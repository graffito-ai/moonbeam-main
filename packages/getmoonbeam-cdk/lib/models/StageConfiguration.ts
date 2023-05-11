import { Stages } from "@moonbeam/moonbeam-models";
import {AmplifyConfiguration} from "./ServiceConfiguration";
import {SESConfiguration} from "@moonbeam/moonbeam-cdk/lib/models/ServiceConfiguration";

/**
 * File used to define the configuration for a stage
 */
export interface StageConfiguration {
    readonly stage: Stages;
    readonly awsAccountId: string;
    readonly amplifyConfig: AmplifyConfiguration;
    readonly sesConfig: SESConfiguration;
    readonly environmentVariables: Map<string, string>;
}
