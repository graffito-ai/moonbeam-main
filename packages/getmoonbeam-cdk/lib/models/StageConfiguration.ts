import { Stages } from "@moonbeam/moonbeam-models";
import {
    AmplifyConfiguration,
    AppSyncConfiguration, CardLinkingConfiguration, MilitaryVerificationConfiguration,
    SESConfiguration,
    StorageConfiguration
} from "./ServiceConfiguration";

/**
 * File used to define the configuration for a stage
 */
export interface StageConfiguration {
    readonly stage: Stages;
    readonly awsAccountId: string;
    readonly amplifyConfig: AmplifyConfiguration;
    readonly sesConfig: SESConfiguration;
    readonly appSyncConfig: AppSyncConfiguration;
    readonly storageConfig: StorageConfiguration;
    readonly militaryVerificationConfig: MilitaryVerificationConfiguration;
    readonly cardLinkingConfig: CardLinkingConfiguration;
    readonly environmentVariables: Map<string, string>;
}
