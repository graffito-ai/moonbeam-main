import {Stages} from "@moonbeam/moonbeam-models";
import {
    AmplifyConfiguration,
    AppSyncConfiguration,
    CardLinkingConfiguration,
    CardLinkingServiceConfiguration,
    MilitaryVerificationConfiguration,
    SESConfiguration,
    StorageConfiguration,
    WebhookTransactionsConfiguration
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
    readonly cardLinkingServiceConfig: CardLinkingServiceConfiguration;
    readonly webhookTransactionsConfig: WebhookTransactionsConfiguration;
    readonly environmentVariables: Map<string, string>;
}
