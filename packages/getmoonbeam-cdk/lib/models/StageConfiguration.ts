import {Stages} from "@moonbeam/moonbeam-models";
import {
    AmplifyConfiguration,
    APIGatewayServiceConfiguration,
    AppSyncConfiguration,
    CardLinkingConfiguration, FAQConfiguration,
    MilitaryVerificationConfiguration,
    NotificationsConfiguration, OffersConfiguration,
    PhysicalDevicesConfiguration,
    ReimbursementEligibilityConfiguration,
    ReimbursementsConfiguration,
    ReimbursementsProducerConsumerConfiguration,
    SESConfiguration,
    StorageConfiguration,
    TransactionsConfiguration,
    TransactionsProducerConsumerConfiguration, UpdatedTransactionsProducerConsumerConfiguration
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
    readonly updatedTransactionsProducerConsumerConfig: UpdatedTransactionsProducerConsumerConfiguration;
    readonly transactionsConfig: TransactionsConfiguration;
    readonly offersConfig: OffersConfiguration;
    readonly faqConfig: FAQConfiguration;
    readonly notificationsConfig: NotificationsConfiguration;
    readonly physicalDevicesConfig: PhysicalDevicesConfiguration;
    readonly environmentVariables: Map<string, string>;
}
