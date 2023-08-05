import {Stages} from "@moonbeam/moonbeam-models";
import {
    AmplifyConfiguration,
    AppSyncConfiguration,
    CardLinkingConfiguration,
    APIGatewayServiceConfiguration,
    MilitaryVerificationConfiguration, ReimbursementsConfiguration, ReimbursementsProducerConsumerConfiguration,
    SESConfiguration,
    StorageConfiguration, TransactionsConfiguration,
    TransactionsProducerConsumerConfiguration
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
    readonly apiGatewayServiceConfig: APIGatewayServiceConfiguration;
    readonly reimbursementsProducerConsumerConfig: ReimbursementsProducerConsumerConfiguration;
    readonly reimbursementsConfig: ReimbursementsConfiguration;
    readonly transactionsProducerConsumerConfig: TransactionsProducerConsumerConfiguration;
    readonly transactionsConfig: TransactionsConfiguration;
    readonly environmentVariables: Map<string, string>;
}
