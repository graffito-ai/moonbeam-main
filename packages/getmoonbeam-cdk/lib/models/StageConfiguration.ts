import {Stages} from "@moonbeam/moonbeam-models";
import {
    AmplifyConfiguration,
    APIGatewayServiceConfiguration, AppsFlyerConfiguration,
    AppSyncConfiguration, AppUpgradeConfiguration,
    CardLinkingConfiguration,
    FAQConfiguration,
    MilitaryVerificationConfiguration,
    MilitaryVerificationProducerConsumerConfiguration,
    NotificationReminderConfiguration,
    NotificationReminderProducerConsumerConfiguration,
    NotificationsConfiguration,
    OffersConfiguration,
    PhysicalDevicesConfiguration,
    SESConfiguration,
    StorageConfiguration,
    TransactionsConfiguration,
    TransactionsProducerConsumerConfiguration,
    UpdatedTransactionsProducerConsumerConfiguration,
    UserAuthSessionConfiguration
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
    readonly notificationReminderProducerConsumerConfig: NotificationReminderProducerConsumerConfiguration;
    readonly transactionsProducerConsumerConfig: TransactionsProducerConsumerConfiguration;
    readonly militaryVerificationProducerConsumerConfig: MilitaryVerificationProducerConsumerConfiguration;
    readonly updatedTransactionsProducerConsumerConfig: UpdatedTransactionsProducerConsumerConfiguration;
    readonly transactionsConfig: TransactionsConfiguration;
    readonly offersConfig: OffersConfiguration;
    readonly faqConfig: FAQConfiguration;
    readonly userAuthSessionConfig: UserAuthSessionConfiguration;
    readonly notificationsConfig: NotificationsConfiguration;
    readonly physicalDevicesConfig: PhysicalDevicesConfiguration;
    readonly notificationReminderConfig: NotificationReminderConfiguration;
    readonly appUpgradeConfig: AppUpgradeConfiguration;
    readonly appsFlyerConfig: AppsFlyerConfiguration;
    readonly environmentVariables: Map<string, string>;
}
