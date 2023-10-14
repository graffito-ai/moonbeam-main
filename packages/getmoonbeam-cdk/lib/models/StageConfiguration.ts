import {Stages} from "@moonbeam/moonbeam-models";
import {
    AmplifyConfiguration,
    APIGatewayServiceConfiguration,
    AppSyncConfiguration,
    CardLinkingConfiguration,
    FAQConfiguration,
    MilitaryVerificationConfiguration,
    MilitaryVerificationProducerConsumerConfiguration, NotificationReminderConfiguration,
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
    readonly environmentVariables: Map<string, string>;
}
