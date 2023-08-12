import {Stages} from "@moonbeam/moonbeam-models";
import {
    AmplifyConfiguration,
    APIGatewayServiceConfiguration,
    AppSyncConfiguration,
    CardLinkingConfiguration,
    MilitaryVerificationConfiguration,
    NotificationsConfiguration,
    PhysicalDevicesConfiguration,
    ReimbursementEligibilityConfiguration,
    ReimbursementsConfiguration,
    ReimbursementsProducerConsumerConfiguration,
    SESConfiguration,
    StorageConfiguration,
    TransactionsConfiguration,
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
    readonly reimbursementEligibilityConfig: ReimbursementEligibilityConfiguration;
    readonly transactionsProducerConsumerConfig: TransactionsProducerConsumerConfiguration;
    readonly transactionsConfig: TransactionsConfiguration;
    readonly notificationsConfig: NotificationsConfiguration;
    readonly physicalDevicesConfig: PhysicalDevicesConfiguration;
    readonly environmentVariables: Map<string, string>;
}
