import {Stages} from "@moonbeam/moonbeam-models";
import {
    AmplifyConfiguration,
    APIGatewayServiceConfiguration, AppReviewConfiguration,
    AppSyncConfiguration, AppUpgradeConfiguration,
    CardLinkingConfiguration,
    FAQConfiguration, LoggingConfiguration,
    MilitaryVerificationConfiguration,
    MilitaryVerificationProducerConsumerConfiguration, MilitaryVerificationReportingProducerConsumerConfiguration,
    NotificationReminderConfiguration,
    NotificationReminderProducerConsumerConfiguration,
    NotificationsConfiguration,
    OffersConfiguration,
    PhysicalDevicesConfiguration, ReferralConfiguration, ReferralProducerConsumerConfiguration,
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
    readonly referralProducerConsumerConfig: ReferralProducerConsumerConfiguration;
    readonly transactionsProducerConsumerConfig: TransactionsProducerConsumerConfiguration;
    readonly militaryVerificationProducerConsumerConfig: MilitaryVerificationProducerConsumerConfiguration;
    readonly militaryVerificationReportingProducerConsumerConfig: MilitaryVerificationReportingProducerConsumerConfiguration;
    readonly updatedTransactionsProducerConsumerConfig: UpdatedTransactionsProducerConsumerConfiguration;
    readonly transactionsConfig: TransactionsConfiguration;
    readonly offersConfig: OffersConfiguration;
    readonly faqConfig: FAQConfiguration;
    readonly userAuthSessionConfig: UserAuthSessionConfiguration;
    readonly notificationsConfig: NotificationsConfiguration;
    readonly physicalDevicesConfig: PhysicalDevicesConfiguration;
    readonly notificationReminderConfig: NotificationReminderConfiguration;
    readonly appUpgradeConfig: AppUpgradeConfiguration;
    readonly appReviewConfig: AppReviewConfiguration;
    readonly referralConfig: ReferralConfiguration;
    readonly loggingConfig: LoggingConfiguration;
    readonly environmentVariables: Map<string, string>;
}
