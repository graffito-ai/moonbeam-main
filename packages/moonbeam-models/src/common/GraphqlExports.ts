export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: string;
  AWSDateTime: string;
  AWSEmail: string;
  AWSIPAddress: string;
  AWSJSON: string;
  AWSPhone: string;
  AWSTime: string;
  AWSTimestamp: number;
  AWSURL: string;
};

export type AddCardInput = {
  card: CardInput;
  id: Scalars['ID'];
  memberId: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type AppReview = {
  __typename?: 'AppReview';
  createdAt: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  updatedAt: Scalars['AWSDateTime'];
};

export enum AppReviewErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type AppReviewResponse = {
  __typename?: 'AppReviewResponse';
  data?: Maybe<AppReview>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<AppReviewErrorType>;
};

export enum AppUpgradeErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type AppUpgradeResponse = {
  __typename?: 'AppUpgradeResponse';
  data?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<AppUpgradeErrorType>;
};

export enum AuthProvider {
  ApiKey = 'apiKey',
  Iam = 'iam',
  Oidc = 'oidc',
  UserPools = 'userPools'
}

export type AuthRule = {
  allow: AuthStrategy;
  groupClaim?: InputMaybe<Scalars['String']>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  groupsField?: InputMaybe<Scalars['String']>;
  identityClaim?: InputMaybe<Scalars['String']>;
  mutations?: InputMaybe<Array<InputMaybe<ModelMutation>>>;
  operations?: InputMaybe<Array<InputMaybe<ModelOperation>>>;
  ownerField?: InputMaybe<Scalars['String']>;
  provider?: InputMaybe<AuthProvider>;
  queries?: InputMaybe<Array<InputMaybe<ModelQuery>>>;
};

export enum AuthStrategy {
  Groups = 'groups',
  Owner = 'owner',
  Private = 'private',
  Public = 'public'
}

export type Card = {
  __typename?: 'Card';
  additionalProgramID?: Maybe<Scalars['String']>;
  applicationID: Scalars['ID'];
  expiration?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  last4: Scalars['String'];
  name: Scalars['String'];
  token: Scalars['String'];
  type: CardType;
};

export type CardDetailsResponse = {
  __typename?: 'CardDetailsResponse';
  data?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

export type CardInput = {
  additionalProgramID?: InputMaybe<Scalars['String']>;
  applicationID?: InputMaybe<Scalars['ID']>;
  expiration: Scalars['String'];
  last4: Scalars['String'];
  name: Scalars['String'];
  token: Scalars['String'];
  type: CardType;
};

export type CardLink = {
  __typename?: 'CardLink';
  cards: Array<Maybe<Card>>;
  createdAt: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  memberId: Scalars['ID'];
  status: CardLinkingStatus;
  updatedAt: Scalars['AWSDateTime'];
};

export enum CardLinkErrorType {
  AlreadyExistent = 'ALREADY_EXISTENT',
  InvalidCardScheme = 'INVALID_CARD_SCHEME',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type CardLinkResponse = {
  __typename?: 'CardLinkResponse';
  data?: Maybe<CardLink>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

export enum CardLinkingStatus {
  Linked = 'LINKED',
  NotLinked = 'NOT_LINKED'
}

export type CardResponse = {
  __typename?: 'CardResponse';
  data?: Maybe<CardUpdate>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

export enum CardType {
  Invalid = 'INVALID',
  Mastercard = 'MASTERCARD',
  Visa = 'VISA'
}

export type CardUpdate = {
  __typename?: 'CardUpdate';
  cardId: Scalars['ID'];
  id: Scalars['ID'];
  updatedAt: Scalars['AWSDateTime'];
};

export enum CountryCode {
  Ca = 'CA',
  Us = 'US'
}

export type CreateAppReviewInput = {
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type CreateBulkNotificationInput = {
  bulkNotifications: Array<InputMaybe<CreateNotificationInput>>;
  channelType: NotificationChannelType;
  type: NotificationType;
};

export type CreateBulkNotificationResponse = {
  __typename?: 'CreateBulkNotificationResponse';
  data?: Maybe<Array<Maybe<Notification>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationsErrorType>;
};

export type CreateCardLinkInput = {
  card: CardInput;
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type CreateDailyEarningsSummaryInput = {
  targetDate: Scalars['AWSDateTime'];
};

export type CreateDeviceInput = {
  deviceState: UserDeviceState;
  id: Scalars['ID'];
  lastLoginDate?: InputMaybe<Scalars['AWSDateTime']>;
  tokenId: Scalars['ID'];
};

export type CreateEventSeriesInput = {
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  externalSeriesID?: InputMaybe<Scalars['ID']>;
  name: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type CreateFaqInput = {
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  facts: Array<InputMaybe<FactInput>>;
  id?: InputMaybe<Scalars['ID']>;
  title: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type CreateLocationBasedOfferReminderInput = {
  expoPushToken: Array<InputMaybe<Scalars['String']>>;
  latitude: Scalars['String'];
  longitude: Scalars['String'];
};

export type CreateLogEventInput = {
  logLevel: LoggingLevel;
  message: Scalars['String'];
};

export type CreateMilitaryVerificationInput = {
  addressLine: Scalars['String'];
  city: Scalars['String'];
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  dateOfBirth: Scalars['String'];
  enlistmentYear: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  militaryAffiliation: MilitaryAffiliation;
  militaryBranch: MilitaryBranch;
  militaryDutyStatus: MilitaryDutyStatus;
  personalIdentifier?: InputMaybe<Scalars['String']>;
  state: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
  zipCode: Scalars['String'];
};

export type CreateMilitaryVerificationResponse = {
  __typename?: 'CreateMilitaryVerificationResponse';
  data?: Maybe<MilitaryVerificationInformation>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<MilitaryVerificationErrorType>;
};

export type CreateNotificationInput = {
  actionUrl?: InputMaybe<Scalars['String']>;
  channelType: NotificationChannelType;
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  dailyEarningsSummaryAmount?: InputMaybe<Scalars['Float']>;
  emailDestination?: InputMaybe<Scalars['String']>;
  expoPushTokens?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id: Scalars['ID'];
  ineligibleTransactionAmount?: InputMaybe<Scalars['Float']>;
  merchantName?: InputMaybe<Scalars['String']>;
  notificationId?: InputMaybe<Scalars['ID']>;
  pendingCashback?: InputMaybe<Scalars['Float']>;
  status: NotificationStatus;
  timestamp?: InputMaybe<Scalars['AWSTimestamp']>;
  transactions?: InputMaybe<Array<InputMaybe<MoonbeamTransactionInput>>>;
  type: NotificationType;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
  userFullName?: InputMaybe<Scalars['String']>;
};

export type CreateNotificationReminderInput = {
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  nextTriggerAt?: InputMaybe<Scalars['AWSDateTime']>;
  notificationChannelType: Array<InputMaybe<NotificationChannelType>>;
  notificationReminderCadence: NotificationReminderCadence;
  notificationReminderCount?: InputMaybe<Scalars['Int']>;
  notificationReminderMaxCount?: InputMaybe<Scalars['Int']>;
  notificationReminderStatus: NotificationReminderStatus;
  notificationReminderType: NotificationReminderType;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type CreateNotificationResponse = {
  __typename?: 'CreateNotificationResponse';
  data?: Maybe<Notification>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationsErrorType>;
  id?: Maybe<Scalars['ID']>;
};

export type CreatePartnerInput = {
  addressLine: Scalars['String'];
  city: Scalars['String'];
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  description: Scalars['String'];
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  isOnline: Scalars['Boolean'];
  logoUrl?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  phoneNumber?: InputMaybe<Scalars['String']>;
  services: Array<InputMaybe<ServiceInput>>;
  shortDescription: Scalars['String'];
  state: Scalars['String'];
  status?: InputMaybe<ServicePartnerStatus>;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
  website: Scalars['String'];
  zipCode: Scalars['String'];
};

export type CreateReferralInput = {
  campaignCode: MarketingCampaignCode;
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  fromId: Scalars['ID'];
  toId: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type CreateReimbursementInput = {
  amount: Scalars['Float'];
  cardId: Scalars['String'];
  cardLast4: Scalars['String'];
  cardType: CardType;
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  reimbursementId?: InputMaybe<Scalars['ID']>;
  status: ReimbursementStatus;
  timestamp?: InputMaybe<Scalars['AWSTimestamp']>;
  transactions: Array<InputMaybe<CreateTransactionInput>>;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type CreateTransactionInput = {
  brandId: Scalars['ID'];
  cardId: Scalars['ID'];
  category: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  creditedCashbackAmount: Scalars['Float'];
  currencyCode: CurrencyCodeType;
  id: Scalars['ID'];
  memberId: Scalars['ID'];
  pendingCashbackAmount: Scalars['Float'];
  rewardAmount: Scalars['Float'];
  storeId: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
  totalAmount: Scalars['Float'];
  transactionBrandAddress: Scalars['String'];
  transactionBrandLogoUrl: Scalars['String'];
  transactionBrandName: Scalars['String'];
  transactionBrandURLAddress: Scalars['String'];
  transactionId: Scalars['ID'];
  transactionIsOnline: Scalars['Boolean'];
  transactionStatus: TransactionsStatus;
  transactionType: TransactionType;
  updatedAt: Scalars['AWSDateTime'];
};

export type CreateUserAuthSessionInput = {
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export enum CurrencyCodeType {
  Usd = 'USD'
}

export type DailyEarningsSummary = {
  __typename?: 'DailyEarningsSummary';
  createdAt: Scalars['AWSDateTime'];
  dailyEarningsSummaryID: Scalars['ID'];
  id: Scalars['ID'];
  status: DailyEarningsSummaryStatus;
  timestamp: Scalars['AWSTimestamp'];
  transactions: Array<Maybe<MoonbeamTransaction>>;
  updatedAt: Scalars['AWSDateTime'];
};

export type DailyEarningsSummaryResponse = {
  __typename?: 'DailyEarningsSummaryResponse';
  data?: Maybe<Array<Maybe<DailyEarningsSummary>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<DailySummaryErrorType>;
};

export enum DailyEarningsSummaryStatus {
  Acknowledged = 'ACKNOWLEDGED',
  Sent = 'SENT'
}

export enum DailySummaryErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type DeleteCardInput = {
  cardId: Scalars['ID'];
  id: Scalars['ID'];
  memberId: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type EligibleLinkedUser = {
  __typename?: 'EligibleLinkedUser';
  cardIds: Array<Maybe<Scalars['ID']>>;
  id: Scalars['ID'];
  memberId: Scalars['ID'];
};

export type EligibleLinkedUsersResponse = {
  __typename?: 'EligibleLinkedUsersResponse';
  data?: Maybe<Array<Maybe<EligibleLinkedUser>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

export type EmailFromCognitoResponse = {
  __typename?: 'EmailFromCognitoResponse';
  data?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationsErrorType>;
};

export type Event = {
  __typename?: 'Event';
  description: Scalars['String'];
  endTime: EventEndDateTime;
  eventLogoUrlBg: Scalars['String'];
  eventLogoUrlSm: Scalars['String'];
  externalEventID: Scalars['ID'];
  id: Scalars['ID'];
  registrationUrl: Scalars['String'];
  startTime: EventStartDateTime;
  title: Scalars['String'];
};

export type EventEndDateTime = {
  __typename?: 'EventEndDateTime';
  endsAtLocal: Scalars['AWSDateTime'];
  endsAtUTC: Scalars['AWSDateTime'];
  timezone: Scalars['String'];
};

export type EventSeries = {
  __typename?: 'EventSeries';
  createdAt: Scalars['AWSDateTime'];
  description: Scalars['String'];
  events: Array<Maybe<Event>>;
  externalOrgID: Scalars['ID'];
  externalSeriesID: Scalars['ID'];
  id: Scalars['ID'];
  name: Scalars['String'];
  seriesLogoUrlBg: Scalars['String'];
  seriesLogoUrlSm: Scalars['String'];
  status: EventSeriesStatus;
  title: Scalars['String'];
  updatedAt: Scalars['AWSDateTime'];
};

export type EventSeriesResponse = {
  __typename?: 'EventSeriesResponse';
  data?: Maybe<Array<Maybe<EventSeries>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<EventsErrorType>;
};

export enum EventSeriesStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export type EventStartDateTime = {
  __typename?: 'EventStartDateTime';
  startsAtLocal: Scalars['AWSDateTime'];
  startsAtUTC: Scalars['AWSDateTime'];
  timezone: Scalars['String'];
};

export enum EventsErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type Faq = {
  __typename?: 'FAQ';
  createdAt: Scalars['AWSDateTime'];
  facts: Array<Maybe<Fact>>;
  id: Scalars['ID'];
  title: Scalars['String'];
  updatedAt: Scalars['AWSDateTime'];
};

export enum FaqErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type FaqResponse = {
  __typename?: 'FAQResponse';
  data?: Maybe<Array<Maybe<Faq>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<FaqErrorType>;
};

export type Fact = {
  __typename?: 'Fact';
  description: Scalars['String'];
  linkLocation?: Maybe<Scalars['String']>;
  linkableKeyword?: Maybe<Scalars['String']>;
  type: FactType;
};

export type FactInput = {
  description: Scalars['String'];
  linkLocation?: InputMaybe<Scalars['String']>;
  linkableKeyword?: InputMaybe<Scalars['String']>;
  type: FactType;
};

export enum FactType {
  Linkable = 'LINKABLE',
  NonLinkable = 'NON_LINKABLE'
}

export type FidelisPartner = {
  __typename?: 'FidelisPartner';
  brandName: Scalars['String'];
  numberOfOffers: Scalars['Int'];
  offers: Array<Maybe<Offer>>;
  veteranOwned: Scalars['Boolean'];
};

export type FidelisPartnerResponse = {
  __typename?: 'FidelisPartnerResponse';
  data?: Maybe<Array<Maybe<FidelisPartner>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<OffersErrorType>;
};

export type File = {
  __typename?: 'File';
  url: Scalars['String'];
};

export enum FileAccessLevel {
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Public = 'PUBLIC'
}

export enum FileType {
  Logofiles = 'LOGOFILES',
  Main = 'MAIN'
}

export type FilesForUserResponse = {
  __typename?: 'FilesForUserResponse';
  data?: Maybe<Array<Maybe<Scalars['String']>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<StorageErrorType>;
};

export type GeocodeAsyncInput = {
  address: Scalars['String'];
  osType: OsType;
};

export type GeocodeAsyncResponse = {
  __typename?: 'GeocodeAsyncResponse';
  data?: Maybe<Array<Maybe<Location>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<UtilitiesErrorType>;
};

export type GetAppReviewEligibilityInput = {
  id: Scalars['ID'];
};

export type GetAppReviewEligibilityResponse = {
  __typename?: 'GetAppReviewEligibilityResponse';
  data?: Maybe<Scalars['Boolean']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<AppReviewErrorType>;
};

export type GetCardLinkInput = {
  id: Scalars['ID'];
};

export type GetDailyEarningsSummaryInput = {
  id: Scalars['ID'];
  targetDate: Scalars['AWSDateTime'];
};

export type GetDevicesForUserInput = {
  id: Scalars['ID'];
};

export type GetFilesForUserInput = {
  id: Scalars['ID'];
  level: FileAccessLevel;
  type: FileType;
};

export type GetLocationPredictionsInput = {
  address: Scalars['String'];
  osType: OsType;
};

export type GetLocationPredictionsResponse = {
  __typename?: 'GetLocationPredictionsResponse';
  data?: Maybe<Array<Maybe<LocationPredictionType>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<UtilitiesErrorType>;
};

export type GetMilitaryVerificationInformationInput = {
  endDate?: InputMaybe<Scalars['AWSDateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  startDate?: InputMaybe<Scalars['AWSDateTime']>;
};

export type GetMilitaryVerificationInput = {
  id: Scalars['ID'];
};

export type GetMilitaryVerificationResponse = {
  __typename?: 'GetMilitaryVerificationResponse';
  data?: Maybe<MilitaryVerificationStatus>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<MilitaryVerificationErrorType>;
};

export type GetNotificationByTypeInput = {
  endDate: Scalars['AWSDateTime'];
  type: NotificationType;
};

export type GetNotificationByTypeResponse = {
  __typename?: 'GetNotificationByTypeResponse';
  data?: Maybe<Array<Maybe<Notification>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationsErrorType>;
};

export type GetOffersInput = {
  availability: OfferAvailability;
  brandName?: InputMaybe<Scalars['String']>;
  countryCode: CountryCode;
  filterType: OfferFilter;
  offerCategory?: InputMaybe<OfferCategory>;
  offerSeasonalType?: InputMaybe<OfferSeasonalType>;
  offerStates: Array<InputMaybe<OfferState>>;
  pageNumber: Scalars['Int'];
  pageSize: Scalars['Int'];
  radius?: InputMaybe<Scalars['Int']>;
  radiusIncludeOnlineStores?: InputMaybe<Scalars['Boolean']>;
  radiusLatitude?: InputMaybe<Scalars['Float']>;
  radiusLongitude?: InputMaybe<Scalars['Float']>;
  redemptionType: RedemptionType;
};

export type GetReferralsByStatusInput = {
  status: ReferralStatus;
};

export type GetReimbursementsInput = {
  endDate: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  startDate?: InputMaybe<Scalars['AWSDateTime']>;
};

export type GetStorageInput = {
  expires?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['String']>;
  level: FileAccessLevel;
  name: Scalars['String'];
  type: FileType;
};

export type GetTransactionByStatusInput = {
  id: Scalars['ID'];
  status: TransactionsStatus;
};

export type GetTransactionInput = {
  endDate: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  startDate?: InputMaybe<Scalars['AWSDateTime']>;
};

export type GetTransactionsInRangeInput = {
  endDate: Scalars['AWSDateTime'];
  startDate: Scalars['AWSDateTime'];
};

export type GetUserAuthSessionInput = {
  id: Scalars['ID'];
};

export type GetUserCardLinkingIdInput = {
  id: Scalars['ID'];
};

export type GetUserCardLinkingIdResponse = {
  __typename?: 'GetUserCardLinkingIdResponse';
  data?: Maybe<Scalars['ID']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

export type GetUserNotificationAssetsInput = {
  idList: Array<InputMaybe<Scalars['ID']>>;
};

export type GetUsersByGeographicalLocationInput = {
  zipCodes: Array<InputMaybe<Scalars['String']>>;
};

export type IneligibleLinkedUsersResponse = {
  __typename?: 'IneligibleLinkedUsersResponse';
  data?: Maybe<Array<Maybe<RetrieveUserDetailsForNotifications>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

export type IneligibleTransaction = {
  __typename?: 'IneligibleTransaction';
  brandId?: Maybe<Scalars['ID']>;
  cardId: Scalars['ID'];
  category: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  creditedCashbackAmount?: Maybe<Scalars['Float']>;
  currencyCode: CurrencyCodeType;
  id?: Maybe<Scalars['ID']>;
  memberId: Scalars['ID'];
  pendingCashbackAmount?: Maybe<Scalars['Float']>;
  rewardAmount?: Maybe<Scalars['Float']>;
  storeId?: Maybe<Scalars['ID']>;
  timestamp: Scalars['AWSTimestamp'];
  totalAmount?: Maybe<Scalars['Float']>;
  transactionBrandAddress?: Maybe<Scalars['String']>;
  transactionBrandLogoUrl?: Maybe<Scalars['String']>;
  transactionBrandName?: Maybe<Scalars['String']>;
  transactionBrandURLAddress?: Maybe<Scalars['String']>;
  transactionId: Scalars['ID'];
  transactionIsOnline?: Maybe<Scalars['Boolean']>;
  transactionStatus: TransactionsStatus;
  transactionType: TransactionType;
  updatedAt?: Maybe<Scalars['AWSDateTime']>;
};

export type IneligibleTransactionResponse = {
  __typename?: 'IneligibleTransactionResponse';
  data?: Maybe<IneligibleTransaction>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export type Location = {
  __typename?: 'Location';
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
};

export type LocationBasedOfferReminderResponse = {
  __typename?: 'LocationBasedOfferReminderResponse';
  data?: Maybe<NotificationStatus>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationsErrorType>;
};

export type LocationPredictionType = {
  __typename?: 'LocationPredictionType';
  address_components?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  matched_substrings?: Maybe<Scalars['String']>;
  place_id?: Maybe<Scalars['String']>;
  reference?: Maybe<Scalars['String']>;
  structured_formatting?: Maybe<Scalars['String']>;
  terms?: Maybe<Scalars['String']>;
  types?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum LoggingAcknowledgmentType {
  Error = 'ERROR',
  Successful = 'SUCCESSFUL'
}

export enum LoggingErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export enum LoggingLevel {
  Debug = 'DEBUG',
  Error = 'ERROR',
  Info = 'INFO',
  Warning = 'WARNING'
}

export type LoggingResponse = {
  __typename?: 'LoggingResponse';
  data?: Maybe<LoggingAcknowledgmentType>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<LoggingErrorType>;
};

export enum MarketingCampaignCode {
  Milbilboard1 = 'MILBILBOARD1',
  Raffleregapr24 = 'RAFFLEREGAPR24',
  Raffleregaug24 = 'RAFFLEREGAUG24',
  Raffleregdec23 = 'RAFFLEREGDEC23',
  Raffleregdec24 = 'RAFFLEREGDEC24',
  Raffleregfeb24 = 'RAFFLEREGFEB24',
  Raffleregjan24 = 'RAFFLEREGJAN24',
  Raffleregjun24 = 'RAFFLEREGJUN24',
  Raffleregmar24 = 'RAFFLEREGMAR24',
  Raffleregoct24 = 'RAFFLEREGOCT24',
  Sunnyactual1 = 'SUNNYACTUAL1'
}

export type Member = {
  __typename?: 'Member';
  id: Scalars['ID'];
  isActive?: Maybe<Scalars['Boolean']>;
  memberId: Scalars['ID'];
};

export type MemberDetailsResponse = {
  __typename?: 'MemberDetailsResponse';
  data?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export type MemberResponse = {
  __typename?: 'MemberResponse';
  data?: Maybe<Member>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

export enum MilitaryAffiliation {
  FamilyChild = 'FAMILY_CHILD',
  FamilyParent = 'FAMILY_PARENT',
  FamilySibling = 'FAMILY_SIBLING',
  FamilySpouse = 'FAMILY_SPOUSE',
  ServiceMember = 'SERVICE_MEMBER'
}

export enum MilitaryBranch {
  AirForce = 'AIR_FORCE',
  Army = 'ARMY',
  CoastGuard = 'COAST_GUARD',
  MarineCorps = 'MARINE_CORPS',
  Navy = 'NAVY',
  NotApplicable = 'NOT_APPLICABLE',
  SpaceForce = 'SPACE_FORCE'
}

export enum MilitaryDutyStatus {
  ActiveDuty = 'ACTIVE_DUTY',
  NationalGuard = 'NATIONAL_GUARD',
  NotApplicable = 'NOT_APPLICABLE',
  Reservist = 'RESERVIST',
  Veteran = 'VETERAN'
}

export enum MilitaryVerificationErrorType {
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  Unprocessable = 'UNPROCESSABLE',
  ValidationError = 'VALIDATION_ERROR'
}

export type MilitaryVerificationInformation = {
  __typename?: 'MilitaryVerificationInformation';
  addressLine: Scalars['String'];
  city: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  dateOfBirth: Scalars['String'];
  enlistmentYear: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  militaryAffiliation: MilitaryAffiliation;
  militaryBranch: MilitaryBranch;
  militaryDutyStatus: MilitaryDutyStatus;
  militaryVerificationStatus: MilitaryVerificationStatusType;
  state: Scalars['String'];
  updatedAt: Scalars['AWSDateTime'];
  zipCode: Scalars['String'];
};

export type MilitaryVerificationNotificationUpdate = {
  __typename?: 'MilitaryVerificationNotificationUpdate';
  addressLine: Scalars['String'];
  city: Scalars['String'];
  dateOfBirth: Scalars['String'];
  enlistmentYear: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  newMilitaryVerificationStatus: MilitaryVerificationStatusType;
  originalMilitaryVerificationStatus: MilitaryVerificationStatusType;
  state: Scalars['String'];
  zipCode: Scalars['String'];
};

export type MilitaryVerificationReportResponse = {
  __typename?: 'MilitaryVerificationReportResponse';
  data?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<StorageErrorType>;
};

export enum MilitaryVerificationReportingErrorType {
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  Unprocessable = 'UNPROCESSABLE',
  ValidationError = 'VALIDATION_ERROR'
}

export type MilitaryVerificationReportingInformation = {
  __typename?: 'MilitaryVerificationReportingInformation';
  addressLine: Scalars['String'];
  city: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  dateOfBirth: Scalars['String'];
  emailAddress?: Maybe<Scalars['String']>;
  enlistmentYear: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  militaryAffiliation: MilitaryAffiliation;
  militaryBranch: MilitaryBranch;
  militaryDutyStatus: MilitaryDutyStatus;
  militaryVerificationStatus: MilitaryVerificationStatusType;
  phoneNumber?: Maybe<Scalars['String']>;
  state: Scalars['String'];
  updatedAt: Scalars['AWSDateTime'];
  zipCode: Scalars['String'];
};

export type MilitaryVerificationReportingInformationResponse = {
  __typename?: 'MilitaryVerificationReportingInformationResponse';
  data?: Maybe<Array<Maybe<MilitaryVerificationReportingInformation>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<MilitaryVerificationReportingErrorType>;
};

export type MilitaryVerificationStatus = {
  __typename?: 'MilitaryVerificationStatus';
  id: Scalars['ID'];
  militaryVerificationStatus: MilitaryVerificationStatusType;
};

export enum MilitaryVerificationStatusType {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Verified = 'VERIFIED'
}

export enum ModelMutation {
  Create = 'create',
  Delete = 'delete',
  Update = 'update'
}

export enum ModelOperation {
  Create = 'create',
  Delete = 'delete',
  Read = 'read',
  Update = 'update'
}

export enum ModelQuery {
  Get = 'get',
  List = 'list'
}

export type MoonbeamBrandStoreLocation = {
  __typename?: 'MoonbeamBrandStoreLocation';
  addressLine?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  countryCode?: Maybe<Scalars['String']>;
  latitude?: Maybe<Scalars['String']>;
  longitude?: Maybe<Scalars['String']>;
  onlineStore: Scalars['Boolean'];
  region?: Maybe<Scalars['String']>;
  storeNumber?: Maybe<Scalars['String']>;
  zipCode?: Maybe<Scalars['String']>;
};

export type MoonbeamRoundupTransaction = {
  __typename?: 'MoonbeamRoundupTransaction';
  accountId: Scalars['ID'];
  availableRoundupAmount: Scalars['Float'];
  brandId: Scalars['ID'];
  category: Scalars['String'];
  categoryLogoURL: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  creditedRoundupAmount: Scalars['Float'];
  currencyCode: CurrencyCodeType;
  id: Scalars['ID'];
  memberId: Scalars['ID'];
  pendingRoundupAmount: Scalars['Float'];
  plaidTransactionStatus: PlaidTransactionsStatus;
  storeId: Scalars['ID'];
  storeLocation: MoonbeamBrandStoreLocation;
  timestamp: Scalars['AWSTimestamp'];
  totalAmount: Scalars['Float'];
  transactionBrandAddress: Scalars['String'];
  transactionBrandLogoUrl: Scalars['String'];
  transactionBrandName: Scalars['String'];
  transactionBrandURLAddress: Scalars['String'];
  transactionId: Scalars['ID'];
  transactionIsOnline: Scalars['Boolean'];
  transactionStatus: RoundupTransactionsStatus;
  transactionType: TransactionType;
  updatedAt: Scalars['AWSDateTime'];
};

export type MoonbeamTransaction = {
  __typename?: 'MoonbeamTransaction';
  brandId: Scalars['ID'];
  cardId: Scalars['ID'];
  category: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  creditedCashbackAmount: Scalars['Float'];
  currencyCode: CurrencyCodeType;
  id: Scalars['ID'];
  memberId: Scalars['ID'];
  pendingCashbackAmount: Scalars['Float'];
  rewardAmount: Scalars['Float'];
  storeId: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
  totalAmount: Scalars['Float'];
  transactionBrandAddress: Scalars['String'];
  transactionBrandLogoUrl: Scalars['String'];
  transactionBrandName: Scalars['String'];
  transactionBrandURLAddress: Scalars['String'];
  transactionId: Scalars['ID'];
  transactionIsOnline: Scalars['Boolean'];
  transactionStatus: TransactionsStatus;
  transactionType: TransactionType;
  updatedAt: Scalars['AWSDateTime'];
};

export type MoonbeamTransactionByStatus = {
  __typename?: 'MoonbeamTransactionByStatus';
  creditedCashbackAmount: Scalars['Float'];
  id: Scalars['ID'];
  pendingCashbackAmount: Scalars['Float'];
  rewardAmount: Scalars['Float'];
  timestamp: Scalars['AWSTimestamp'];
  totalAmount: Scalars['Float'];
  transactionId: Scalars['ID'];
  transactionStatus: TransactionsStatus;
};

export type MoonbeamTransactionInput = {
  brandId: Scalars['ID'];
  cardId: Scalars['ID'];
  category: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  creditedCashbackAmount: Scalars['Float'];
  currencyCode: CurrencyCodeType;
  id: Scalars['ID'];
  memberId: Scalars['ID'];
  pendingCashbackAmount: Scalars['Float'];
  rewardAmount: Scalars['Float'];
  storeId: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
  totalAmount: Scalars['Float'];
  transactionBrandAddress: Scalars['String'];
  transactionBrandLogoUrl: Scalars['String'];
  transactionBrandName: Scalars['String'];
  transactionBrandURLAddress: Scalars['String'];
  transactionId: Scalars['ID'];
  transactionIsOnline: Scalars['Boolean'];
  transactionStatus: TransactionsStatus;
  transactionType: TransactionType;
  updatedAt: Scalars['AWSDateTime'];
};

export type MoonbeamTransactionResponse = {
  __typename?: 'MoonbeamTransactionResponse';
  data?: Maybe<MoonbeamTransaction>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
  id?: Maybe<Scalars['ID']>;
};

export type MoonbeamTransactionsByStatusResponse = {
  __typename?: 'MoonbeamTransactionsByStatusResponse';
  data?: Maybe<Array<Maybe<MoonbeamTransactionByStatus>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export type MoonbeamTransactionsResponse = {
  __typename?: 'MoonbeamTransactionsResponse';
  data?: Maybe<Array<Maybe<MoonbeamTransaction>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export type MoonbeamUpdatedTransaction = {
  __typename?: 'MoonbeamUpdatedTransaction';
  id: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
  transactionId: Scalars['ID'];
  transactionStatus: TransactionsStatus;
  updatedAt: Scalars['AWSDateTime'];
};

export type MoonbeamUpdatedTransactionResponse = {
  __typename?: 'MoonbeamUpdatedTransactionResponse';
  data?: Maybe<MoonbeamUpdatedTransaction>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
  id?: Maybe<Scalars['ID']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acknowledgeLocationUpdate: LocationBasedOfferReminderResponse;
  addCard: CardLinkResponse;
  createAppReview: AppReviewResponse;
  createBulkNotification: CreateBulkNotificationResponse;
  createCardLink: CardLinkResponse;
  createDailyEarningsSummary: DailyEarningsSummaryResponse;
  createDevice: UserDeviceResponse;
  createEventSeries: EventSeriesResponse;
  createFAQ: FaqResponse;
  createLogEvent: LoggingResponse;
  createMilitaryVerification: CreateMilitaryVerificationResponse;
  createNotification: CreateNotificationResponse;
  createNotificationReminder: NotificationReminderResponse;
  createReferral: ReferralResponse;
  createReimbursement: ReimbursementResponse;
  createServicePartner: PartnerResponse;
  createTransaction: MoonbeamTransactionResponse;
  createUserAuthSession: UserAuthSessionResponse;
  deleteCard: CardResponse;
  putMilitaryVerificationReport: MilitaryVerificationReportResponse;
  updateCard: EligibleLinkedUsersResponse;
  updateDailyEarningsSummary: DailyEarningsSummaryResponse;
  updateMilitaryVerificationStatus: UpdateMilitaryVerificationResponse;
  updateNotificationReminder: NotificationReminderResponse;
  updateReferral: ReferralResponse;
  updateTransaction: MoonbeamUpdatedTransactionResponse;
  updateUserAuthSession: UserAuthSessionResponse;
};


export type MutationAcknowledgeLocationUpdateArgs = {
  createLocationBasedOfferReminderInput: CreateLocationBasedOfferReminderInput;
};


export type MutationAddCardArgs = {
  addCardInput: AddCardInput;
};


export type MutationCreateAppReviewArgs = {
  createAppReviewInput: CreateAppReviewInput;
};


export type MutationCreateBulkNotificationArgs = {
  createBulkNotificationInput: CreateBulkNotificationInput;
};


export type MutationCreateCardLinkArgs = {
  createCardLinkInput: CreateCardLinkInput;
};


export type MutationCreateDailyEarningsSummaryArgs = {
  createDailyEarningsSummaryInput: CreateDailyEarningsSummaryInput;
};


export type MutationCreateDeviceArgs = {
  createDeviceInput: CreateDeviceInput;
};


export type MutationCreateEventSeriesArgs = {
  createEventSeriesInput: CreateEventSeriesInput;
};


export type MutationCreateFaqArgs = {
  createFAQInput: CreateFaqInput;
};


export type MutationCreateLogEventArgs = {
  createLogEventInput: CreateLogEventInput;
};


export type MutationCreateMilitaryVerificationArgs = {
  createMilitaryVerificationInput: CreateMilitaryVerificationInput;
};


export type MutationCreateNotificationArgs = {
  createNotificationInput: CreateNotificationInput;
};


export type MutationCreateNotificationReminderArgs = {
  createNotificationReminderInput: CreateNotificationReminderInput;
};


export type MutationCreateReferralArgs = {
  createReferralInput: CreateReferralInput;
};


export type MutationCreateReimbursementArgs = {
  createReimbursementInput: CreateReimbursementInput;
};


export type MutationCreateServicePartnerArgs = {
  createPartnerInput: CreatePartnerInput;
};


export type MutationCreateTransactionArgs = {
  createTransactionInput: CreateTransactionInput;
};


export type MutationCreateUserAuthSessionArgs = {
  createUserAuthSessionInput: CreateUserAuthSessionInput;
};


export type MutationDeleteCardArgs = {
  deleteCardInput: DeleteCardInput;
};


export type MutationPutMilitaryVerificationReportArgs = {
  putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput;
};


export type MutationUpdateCardArgs = {
  updateCardInput: UpdateCardInput;
};


export type MutationUpdateDailyEarningsSummaryArgs = {
  updateDailyEarningsSummaryInput: UpdateDailyEarningsSummaryInput;
};


export type MutationUpdateMilitaryVerificationStatusArgs = {
  updateMilitaryVerificationInput: UpdateMilitaryVerificationInput;
};


export type MutationUpdateNotificationReminderArgs = {
  updateNotificationReminderInput: UpdateNotificationReminderInput;
};


export type MutationUpdateReferralArgs = {
  updateReferralInput: UpdateReferralInput;
};


export type MutationUpdateTransactionArgs = {
  updateTransactionInput: UpdateTransactionInput;
};


export type MutationUpdateUserAuthSessionArgs = {
  updateUserAuthSessionInput: UpdateUserAuthSessionInput;
};

export type Notification = {
  __typename?: 'Notification';
  actionUrl?: Maybe<Scalars['String']>;
  channelType: NotificationChannelType;
  createdAt: Scalars['AWSDateTime'];
  emailDestination?: Maybe<Scalars['String']>;
  expoPushTokens?: Maybe<Array<Maybe<Scalars['String']>>>;
  id: Scalars['ID'];
  merchantName?: Maybe<Scalars['String']>;
  notificationId: Scalars['ID'];
  pendingCashback?: Maybe<Scalars['Float']>;
  status: NotificationStatus;
  timestamp: Scalars['AWSTimestamp'];
  type: NotificationType;
  updatedAt: Scalars['AWSDateTime'];
  userFullName?: Maybe<Scalars['String']>;
};

export enum NotificationChannelType {
  Email = 'EMAIL',
  Push = 'PUSH',
  Sms = 'SMS'
}

export type NotificationReminder = {
  __typename?: 'NotificationReminder';
  createdAt: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  nextTriggerAt: Scalars['AWSDateTime'];
  notificationChannelType: Array<Maybe<NotificationChannelType>>;
  notificationReminderCadence: NotificationReminderCadence;
  notificationReminderCount: Scalars['Int'];
  notificationReminderMaxCount: Scalars['Int'];
  notificationReminderStatus: NotificationReminderStatus;
  notificationReminderType: NotificationReminderType;
  updatedAt: Scalars['AWSDateTime'];
};

export enum NotificationReminderCadence {
  BiWeekly = 'BI_WEEKLY',
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  OneTime = 'ONE_TIME',
  Weekly = 'WEEKLY'
}

export enum NotificationReminderErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type NotificationReminderResponse = {
  __typename?: 'NotificationReminderResponse';
  data?: Maybe<Array<Maybe<NotificationReminder>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationReminderErrorType>;
};

export enum NotificationReminderStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export enum NotificationReminderType {
  CardLinkingReminder = 'CARD_LINKING_REMINDER',
  FeedbackTemplate_1Reminder = 'FEEDBACK_TEMPLATE_1_REMINDER',
  LocationBasedOfferReminder = 'LOCATION_BASED_OFFER_REMINDER',
  MultipleCardFeatureReminder = 'MULTIPLE_CARD_FEATURE_REMINDER',
  NewMapFeatureReminder = 'NEW_MAP_FEATURE_REMINDER',
  ReferralTemplate_1Reminder = 'REFERRAL_TEMPLATE_1_REMINDER',
  ReferralTemplate_2Reminder = 'REFERRAL_TEMPLATE_2_REMINDER',
  ReferralTemplate_3Reminder = 'REFERRAL_TEMPLATE_3_REMINDER',
  ReferralTemplateLaunch = 'REFERRAL_TEMPLATE_LAUNCH',
  ReimbursementsReminder = 'REIMBURSEMENTS_REMINDER',
  RoundupsWaitlistTemplate_1Reminder = 'ROUNDUPS_WAITLIST_TEMPLATE_1_REMINDER',
  SanAntonioReferralTemplate_1Reminder = 'SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER',
  SpendingTemplate_1Reminder = 'SPENDING_TEMPLATE_1_REMINDER',
  SpouseFeatureReminder = 'SPOUSE_FEATURE_REMINDER',
  VeteransDayTemplate_1Reminder = 'VETERANS_DAY_TEMPLATE_1_REMINDER',
  VeteransDayTemplate_2Reminder = 'VETERANS_DAY_TEMPLATE_2_REMINDER',
  VeteransDayTemplate_3Reminder = 'VETERANS_DAY_TEMPLATE_3_REMINDER'
}

export type NotificationResponse = {
  __typename?: 'NotificationResponse';
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationsErrorType>;
  requestId?: Maybe<Scalars['ID']>;
};

export enum NotificationStatus {
  Acknowledged = 'ACKNOWLEDGED',
  Sent = 'SENT'
}

export enum NotificationType {
  CardLinkingReminder = 'CARD_LINKING_REMINDER',
  DailyEarningsSummary = 'DAILY_EARNINGS_SUMMARY',
  EligibleForReimbursement = 'ELIGIBLE_FOR_REIMBURSEMENT',
  ExpirationLinkedCardNotice = 'EXPIRATION_LINKED_CARD_NOTICE',
  ExpiredLinkedCard = 'EXPIRED_LINKED_CARD',
  FeedbackTemplate_1Reminder = 'FEEDBACK_TEMPLATE_1_REMINDER',
  IneligibleTransaction = 'INELIGIBLE_TRANSACTION',
  LocationBasedOfferReminder = 'LOCATION_BASED_OFFER_REMINDER',
  MarketingRelated = 'MARKETING_RELATED',
  MilitaryStatusChangedPendingToRejected = 'MILITARY_STATUS_CHANGED_PENDING_TO_REJECTED',
  MilitaryStatusChangedPendingToVerified = 'MILITARY_STATUS_CHANGED_PENDING_TO_VERIFIED',
  MultipleCardFeatureReminder = 'MULTIPLE_CARD_FEATURE_REMINDER',
  NewMapFeatureReminder = 'NEW_MAP_FEATURE_REMINDER',
  NewQualifyingOfferAvailable = 'NEW_QUALIFYING_OFFER_AVAILABLE',
  NewUserSignup = 'NEW_USER_SIGNUP',
  QualifyingOffer = 'QUALIFYING_OFFER',
  ReferralTemplate_1Reminder = 'REFERRAL_TEMPLATE_1_REMINDER',
  ReferralTemplate_2Reminder = 'REFERRAL_TEMPLATE_2_REMINDER',
  ReferralTemplate_3Reminder = 'REFERRAL_TEMPLATE_3_REMINDER',
  ReferralTemplateLaunch = 'REFERRAL_TEMPLATE_LAUNCH',
  ReimbursementsReminder = 'REIMBURSEMENTS_REMINDER',
  RoundupsWaitlistTemplate_1Reminder = 'ROUNDUPS_WAITLIST_TEMPLATE_1_REMINDER',
  SanAntonioReferralTemplate_1Reminder = 'SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER',
  SpendingTemplate_1Reminder = 'SPENDING_TEMPLATE_1_REMINDER',
  SpouseFeatureReminder = 'SPOUSE_FEATURE_REMINDER',
  VeteransDayTemplate_1Reminder = 'VETERANS_DAY_TEMPLATE_1_REMINDER',
  VeteransDayTemplate_2Reminder = 'VETERANS_DAY_TEMPLATE_2_REMINDER',
  VeteransDayTemplate_3Reminder = 'VETERANS_DAY_TEMPLATE_3_REMINDER'
}

export enum NotificationsErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export enum OsType {
  Android = 'ANDROID',
  Ios = 'IOS'
}

export type Offer = {
  __typename?: 'Offer';
  availability?: Maybe<OfferAvailability>;
  brandBanner?: Maybe<Scalars['String']>;
  brandDba?: Maybe<Scalars['String']>;
  brandId?: Maybe<Scalars['ID']>;
  brandLogo?: Maybe<Scalars['String']>;
  brandLogoSm?: Maybe<Scalars['String']>;
  brandParentCategory?: Maybe<Scalars['String']>;
  brandStubCopy?: Maybe<Scalars['String']>;
  brandWebsite?: Maybe<Scalars['String']>;
  budget?: Maybe<Scalars['Float']>;
  corporateId?: Maybe<Scalars['ID']>;
  created?: Maybe<Scalars['AWSDateTime']>;
  currency?: Maybe<CurrencyCodeType>;
  daysAvailability?: Maybe<Array<Maybe<Scalars['Int']>>>;
  description?: Maybe<Scalars['String']>;
  endDate?: Maybe<Scalars['AWSDateTime']>;
  extOfferId?: Maybe<Scalars['ID']>;
  id?: Maybe<Scalars['ID']>;
  offerState?: Maybe<OfferState>;
  purchaseAmount?: Maybe<Scalars['Float']>;
  purchaseFrequency?: Maybe<Scalars['Int']>;
  qualifier?: Maybe<Scalars['String']>;
  reach?: Maybe<OfferReach>;
  redeemLimitPerUser?: Maybe<Scalars['Int']>;
  redemptionInstructionUrl?: Maybe<Scalars['String']>;
  redemptionTrigger?: Maybe<RedemptionTrigger>;
  redemptionType?: Maybe<RedemptionType>;
  reward?: Maybe<Reward>;
  startDate?: Maybe<Scalars['AWSDateTime']>;
  storeDetails?: Maybe<Array<Maybe<OfferStore>>>;
  stores?: Maybe<Array<Maybe<Scalars['ID']>>>;
  supplierOfferKey?: Maybe<Scalars['ID']>;
  tile?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  totalRedeemLimit?: Maybe<Scalars['Int']>;
};

export enum OfferAvailability {
  All = 'all',
  ClientOnly = 'client_only',
  Global = 'global'
}

export enum OfferCategory {
  Automotive = 'automotive',
  ChildrenAndFamily = 'children_and_family',
  Electronics = 'electronics',
  Entertainment = 'entertainment',
  FinancialServices = 'financial_services',
  Food = 'food',
  HealthAndBeauty = 'health_and_beauty',
  Home = 'home',
  OfficeAndBusiness = 'office_and_business',
  Retail = 'retail',
  ServicesAndSubscriptions = 'services_and_subscriptions',
  Travel = 'travel',
  UtilitiesAndTelecom = 'utilities_and_telecom',
  VeteranDay = 'veteran_day'
}

export enum OfferFilter {
  CategorizedNearby = 'CATEGORIZED_NEARBY',
  CategorizedOnline = 'CATEGORIZED_ONLINE',
  Fidelis = 'FIDELIS',
  Nearby = 'NEARBY',
  Online = 'ONLINE',
  PremierNearby = 'PREMIER_NEARBY',
  PremierOnline = 'PREMIER_ONLINE',
  SeasonalNearby = 'SEASONAL_NEARBY',
  SeasonalOnline = 'SEASONAL_ONLINE',
  VeteransDay = 'VETERANS_DAY'
}

export type OfferIdResponse = {
  __typename?: 'OfferIdResponse';
  data?: Maybe<Scalars['ID']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export enum OfferReach {
  National = 'national',
  OnlineOnly = 'online_only',
  State = 'state'
}

export type OfferRedemptionTypeResponse = {
  __typename?: 'OfferRedemptionTypeResponse';
  data?: Maybe<RedemptionType>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export enum OfferSeasonalType {
  VeteransDay = 'VETERANS_DAY'
}

export enum OfferState {
  Active = 'active',
  Archived = 'archived',
  Expired = 'expired',
  Paused = 'paused',
  Pending = 'pending',
  Scheduled = 'scheduled'
}

export type OfferStore = {
  __typename?: 'OfferStore';
  address1?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  countryCode?: Maybe<CountryCode>;
  distance?: Maybe<Scalars['Float']>;
  geoLocation?: Maybe<OfferStoreGeoLocation>;
  id?: Maybe<Scalars['ID']>;
  isOnline?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  postCode?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
};

export type OfferStoreGeoLocation = {
  __typename?: 'OfferStoreGeoLocation';
  latitude?: Maybe<Scalars['Float']>;
  longitude?: Maybe<Scalars['Float']>;
};

export enum OffersErrorType {
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type OffersPaginatedResponse = {
  __typename?: 'OffersPaginatedResponse';
  offers: Array<Maybe<Offer>>;
  totalNumberOfPages: Scalars['Int'];
  totalNumberOfRecords: Scalars['Int'];
};

export type OffersResponse = {
  __typename?: 'OffersResponse';
  data?: Maybe<OffersPaginatedResponse>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<OffersErrorType>;
};

export type Partner = {
  __typename?: 'Partner';
  addressLine: Scalars['String'];
  city: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  description: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  isOnline: Scalars['Boolean'];
  logoUrl: Scalars['String'];
  name: Scalars['String'];
  phoneNumber?: Maybe<Scalars['String']>;
  services: Array<Maybe<Service>>;
  shortDescription: Scalars['String'];
  state: Scalars['String'];
  status: ServicePartnerStatus;
  updatedAt: Scalars['AWSDateTime'];
  website: Scalars['String'];
  zipCode: Scalars['String'];
};

export type PartnerResponse = {
  __typename?: 'PartnerResponse';
  data?: Maybe<Array<Maybe<Partner>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<ServicesErrorType>;
};

export enum PlaidTransactionsStatus {
  Added = 'ADDED',
  Modified = 'MODIFIED',
  Removed = 'REMOVED'
}

export type PushDevice = {
  __typename?: 'PushDevice';
  deviceState: UserDeviceState;
  id: Scalars['ID'];
  lastLoginDate: Scalars['AWSDateTime'];
  tokenId: Scalars['ID'];
};

export type PutMilitaryVerificationReportInput = {
  addressLine: Scalars['String'];
  city: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  date: Scalars['AWSDate'];
  dateOfBirth: Scalars['String'];
  emailAddress: Scalars['String'];
  enlistmentYear: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  militaryAffiliation: MilitaryAffiliation;
  militaryBranch: MilitaryBranch;
  militaryDutyStatus: MilitaryDutyStatus;
  militaryVerificationStatus: MilitaryVerificationStatusType;
  phoneNumber: Scalars['String'];
  reportNumber: Scalars['AWSTimestamp'];
  state: Scalars['String'];
  updatedAt: Scalars['AWSDateTime'];
  zipCode: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  geoCodeAsync: GeocodeAsyncResponse;
  getAllDevices: UserDevicesResponse;
  getAllUsersEligibleForReimbursements: UserForNotificationReminderResponse;
  getAllUsersForNotificationReminders: UserForNotificationReminderResponse;
  getAllUsersIneligibleForReimbursements: UserForNotificationReminderResponse;
  getAppReviewEligibility: GetAppReviewEligibilityResponse;
  getAppUpgradeCredentials: AppUpgradeResponse;
  getCardLink: CardLinkResponse;
  getDailyEarningsSummary: DailyEarningsSummaryResponse;
  getDevicesForUser: UserDevicesResponse;
  getEligibleLinkedUsers: EligibleLinkedUsersResponse;
  getEventSeries: EventSeriesResponse;
  getFAQs: FaqResponse;
  getFidelisPartners: FidelisPartnerResponse;
  getFilesForUser: FilesForUserResponse;
  getLocationPredictions: GetLocationPredictionsResponse;
  getMilitaryVerificationInformation: MilitaryVerificationReportingInformationResponse;
  getMilitaryVerificationStatus: GetMilitaryVerificationResponse;
  getNotificationByType: GetNotificationByTypeResponse;
  getNotificationReminders: NotificationReminderResponse;
  getOffers: OffersResponse;
  getPremierOffers: OffersResponse;
  getReferralsByStatus: ReferralResponse;
  getReimbursements: ReimbursementResponse;
  getSeasonalOffers: OffersResponse;
  getServicePartners: PartnerResponse;
  getStorage: StorageResponse;
  getTransaction: MoonbeamTransactionsResponse;
  getTransactionByStatus: MoonbeamTransactionsByStatusResponse;
  getTransactionsInRange: MoonbeamTransactionsResponse;
  getUserAuthSession: UserAuthSessionResponse;
  getUserCardLinkingId: GetUserCardLinkingIdResponse;
  getUserFromReferral: UserFromReferralResponse;
  getUserNotificationAssets: UserNotificationAssetsResponse;
  getUsersByGeographyForNotificationReminders: UserForNotificationReminderResponse;
  getUsersWithNoCards: IneligibleLinkedUsersResponse;
  searchOffers: OffersResponse;
};


export type QueryGeoCodeAsyncArgs = {
  geocodeAsyncInput: GeocodeAsyncInput;
};


export type QueryGetAppReviewEligibilityArgs = {
  getAppReviewEligibilityInput: GetAppReviewEligibilityInput;
};


export type QueryGetCardLinkArgs = {
  getCardLinkInput: GetCardLinkInput;
};


export type QueryGetDailyEarningsSummaryArgs = {
  getDailyEarningsSummaryInput: GetDailyEarningsSummaryInput;
};


export type QueryGetDevicesForUserArgs = {
  getDevicesForUserInput: GetDevicesForUserInput;
};


export type QueryGetFilesForUserArgs = {
  getFilesForUserInput: GetFilesForUserInput;
};


export type QueryGetLocationPredictionsArgs = {
  getLocationPredictionsInput: GetLocationPredictionsInput;
};


export type QueryGetMilitaryVerificationInformationArgs = {
  getMilitaryVerificationInformationInput: GetMilitaryVerificationInformationInput;
};


export type QueryGetMilitaryVerificationStatusArgs = {
  getMilitaryVerificationInput: GetMilitaryVerificationInput;
};


export type QueryGetNotificationByTypeArgs = {
  getNotificationByTypeInput: GetNotificationByTypeInput;
};


export type QueryGetOffersArgs = {
  getOffersInput: GetOffersInput;
};


export type QueryGetPremierOffersArgs = {
  getOffersInput: GetOffersInput;
};


export type QueryGetReferralsByStatusArgs = {
  getReferralsByStatusInput: GetReferralsByStatusInput;
};


export type QueryGetReimbursementsArgs = {
  getReimbursementsInput: GetReimbursementsInput;
};


export type QueryGetSeasonalOffersArgs = {
  getOffersInput: GetOffersInput;
};


export type QueryGetStorageArgs = {
  getStorageInput: GetStorageInput;
};


export type QueryGetTransactionArgs = {
  getTransactionInput: GetTransactionInput;
};


export type QueryGetTransactionByStatusArgs = {
  getTransactionByStatusInput: GetTransactionByStatusInput;
};


export type QueryGetTransactionsInRangeArgs = {
  getTransactionsInRangeInput: GetTransactionsInRangeInput;
};


export type QueryGetUserAuthSessionArgs = {
  getUserAuthSessionInput: GetUserAuthSessionInput;
};


export type QueryGetUserCardLinkingIdArgs = {
  getUserCardLinkingIdInput: GetUserCardLinkingIdInput;
};


export type QueryGetUserFromReferralArgs = {
  userFromReferralInput: UserFromReferralInput;
};


export type QueryGetUserNotificationAssetsArgs = {
  getUserNotificationAssetsInput: GetUserNotificationAssetsInput;
};


export type QueryGetUsersByGeographyForNotificationRemindersArgs = {
  getUsersByGeographicalLocationInput: GetUsersByGeographicalLocationInput;
};


export type QuerySearchOffersArgs = {
  searchOffersInput: SearchOffersInput;
};

export enum RedemptionTrigger {
  CumulativePurchaseAmount = 'cumulative_purchase_amount',
  MinimumPurchaseAmount = 'minimum_purchase_amount',
  PurchaseFrequency = 'purchase_frequency'
}

export enum RedemptionType {
  All = 'all',
  Cardlinked = 'cardlinked',
  Click = 'click',
  Mobile = 'mobile'
}

export type Referral = {
  __typename?: 'Referral';
  campaignCode: MarketingCampaignCode;
  createdAt: Scalars['AWSDateTime'];
  fromId: Scalars['ID'];
  status: ReferralStatus;
  timestamp: Scalars['AWSTimestamp'];
  toId: Scalars['ID'];
  updatedAt: Scalars['AWSDateTime'];
};

export enum ReferralErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type ReferralResponse = {
  __typename?: 'ReferralResponse';
  data?: Maybe<Array<Maybe<Referral>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<ReferralErrorType>;
};

export enum ReferralStatus {
  Invalid = 'INVALID',
  Pending = 'PENDING',
  Redeemed = 'REDEEMED',
  Valid = 'VALID'
}

export type Reimbursement = {
  __typename?: 'Reimbursement';
  amount: Scalars['Float'];
  cardId: Scalars['String'];
  cardLast4: Scalars['String'];
  cardType: CardType;
  createdAt: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  reimbursementId: Scalars['ID'];
  status: ReimbursementStatus;
  timestamp: Scalars['AWSTimestamp'];
  transactions: Array<Maybe<Transaction>>;
  updatedAt: Scalars['AWSDateTime'];
};

export type ReimbursementProcessingResponse = {
  __typename?: 'ReimbursementProcessingResponse';
  data?: Maybe<ReimbursementProcessingStatus>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<ReimbursementsErrorType>;
};

export enum ReimbursementProcessingStatus {
  Failed = 'FAILED',
  Success = 'SUCCESS'
}

export type ReimbursementResponse = {
  __typename?: 'ReimbursementResponse';
  data?: Maybe<Array<Maybe<Reimbursement>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<ReimbursementsErrorType>;
};

export enum ReimbursementStatus {
  Declined = 'DECLINED',
  Pending = 'PENDING',
  Processed = 'PROCESSED',
  Rejected = 'REJECTED'
}

export enum ReimbursementsErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type RemoveCardResponse = {
  __typename?: 'RemoveCardResponse';
  data?: Maybe<Scalars['Boolean']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

export type RetrieveUserDetailsForNotifications = {
  __typename?: 'RetrieveUserDetailsForNotifications';
  email: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
};

export type Reward = {
  __typename?: 'Reward';
  maxValue?: Maybe<Scalars['Float']>;
  type?: Maybe<RewardType>;
  value?: Maybe<Scalars['Float']>;
};

export enum RewardType {
  Fixed = 'fixed',
  Percentage = 'percentage',
  RewardAmount = 'reward_amount',
  RewardPercent = 'reward_percent'
}

export enum RoundupTransactionsStatus {
  Credited = 'CREDITED',
  Pending = 'PENDING',
  Processed = 'PROCESSED'
}

export type SearchOffersInput = {
  radius?: InputMaybe<Scalars['Int']>;
  radiusLatitude?: InputMaybe<Scalars['Float']>;
  radiusLongitude?: InputMaybe<Scalars['Float']>;
  searchText: Scalars['String'];
};

export type SendBulkEmailNotificationInput = {
  emailNotificationInputs: Array<InputMaybe<SendEmailNotificationInput>>;
};

export type SendBulkMobilePushNotificationInput = {
  mobilePushNotificationInputs: Array<InputMaybe<SendMobilePushNotificationInput>>;
};

export type SendEmailNotificationInput = {
  dailyEarningsSummaryAmount?: InputMaybe<Scalars['Float']>;
  emailDestination: Scalars['String'];
  transactions?: InputMaybe<Array<InputMaybe<MoonbeamTransactionInput>>>;
  userFullName: Scalars['String'];
};

export type SendMobilePushNotificationInput = {
  dailyEarningsSummaryAmount?: InputMaybe<Scalars['Float']>;
  expoPushTokens: Array<InputMaybe<Scalars['String']>>;
  ineligibleTransactionAmount?: InputMaybe<Scalars['Float']>;
  merchantName?: InputMaybe<Scalars['String']>;
  pendingCashback?: InputMaybe<Scalars['Float']>;
};

export type Service = {
  __typename?: 'Service';
  description: Scalars['String'];
  title: Scalars['String'];
};

export type ServiceInput = {
  description: Scalars['String'];
  title: Scalars['String'];
};

export enum ServicePartnerStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export enum ServicesErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export enum StorageErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  RestrictedAccess = 'RESTRICTED_ACCESS',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type StorageResponse = {
  __typename?: 'StorageResponse';
  data?: Maybe<File>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<StorageErrorType>;
};

export type Subscription = {
  __typename?: 'Subscription';
  createdTransaction?: Maybe<MoonbeamTransactionResponse>;
  updatedMilitaryVerificationStatus?: Maybe<UpdateMilitaryVerificationResponse>;
  updatedTransaction?: Maybe<MoonbeamUpdatedTransactionResponse>;
};


export type SubscriptionCreatedTransactionArgs = {
  id: Scalars['ID'];
};


export type SubscriptionUpdatedMilitaryVerificationStatusArgs = {
  id: Scalars['ID'];
};


export type SubscriptionUpdatedTransactionArgs = {
  id: Scalars['ID'];
};

export type Transaction = {
  __typename?: 'Transaction';
  brandId: Scalars['ID'];
  cardId: Scalars['ID'];
  category: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  creditedCashbackAmount?: Maybe<Scalars['Float']>;
  currencyCode: CurrencyCodeType;
  id?: Maybe<Scalars['ID']>;
  memberId: Scalars['ID'];
  pendingCashbackAmount?: Maybe<Scalars['Float']>;
  rewardAmount?: Maybe<Scalars['Float']>;
  storeId: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
  totalAmount?: Maybe<Scalars['Float']>;
  transactionBrandAddress?: Maybe<Scalars['String']>;
  transactionBrandLogoUrl?: Maybe<Scalars['String']>;
  transactionBrandName?: Maybe<Scalars['String']>;
  transactionBrandURLAddress?: Maybe<Scalars['String']>;
  transactionId: Scalars['ID'];
  transactionIsOnline?: Maybe<Scalars['Boolean']>;
  transactionStatus: TransactionsStatus;
  transactionType: TransactionType;
  updatedAt?: Maybe<Scalars['AWSDateTime']>;
};

export type TransactionResponse = {
  __typename?: 'TransactionResponse';
  data?: Maybe<Transaction>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export type TransactionStatusDetails = {
  __typename?: 'TransactionStatusDetails';
  creditedCashbackAmount: Scalars['Float'];
  oliveTransactionStatus: Scalars['String'];
  pendingCashbackAmount: Scalars['Float'];
  rewardAmount: Scalars['Float'];
  totalAmount: Scalars['Float'];
};

export type TransactionStatusDetailsResponse = {
  __typename?: 'TransactionStatusDetailsResponse';
  data?: Maybe<TransactionStatusDetails>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export enum TransactionType {
  Contribution = 'CONTRIBUTION',
  OfferRedeemed = 'OFFER_REDEEMED',
  OliveIneligibleMatched = 'OLIVE_INELIGIBLE_MATCHED',
  OliveIneligibleUnmatched = 'OLIVE_INELIGIBLE_UNMATCHED',
  Roundup = 'ROUNDUP'
}

export enum TransactionsErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  Unprocessable = 'UNPROCESSABLE',
  ValidationError = 'VALIDATION_ERROR'
}

export enum TransactionsStatus {
  Credited = 'CREDITED',
  Fronted = 'FRONTED',
  Funded = 'FUNDED',
  Pending = 'PENDING',
  Processed = 'PROCESSED',
  Rejected = 'REJECTED'
}

export type UpdateCardInput = {
  cardId: Scalars['ID'];
  expirationDate: Scalars['String'];
  id: Scalars['ID'];
  memberId: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type UpdateDailyEarningsSummaryInput = {
  id: Scalars['ID'];
  status: DailyEarningsSummaryStatus;
  targetDate: Scalars['AWSDateTime'];
};

export type UpdateMilitaryVerificationInput = {
  id: Scalars['ID'];
  militaryVerificationStatus: MilitaryVerificationStatusType;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type UpdateMilitaryVerificationResponse = {
  __typename?: 'UpdateMilitaryVerificationResponse';
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<MilitaryVerificationErrorType>;
  id?: Maybe<Scalars['ID']>;
  militaryVerificationStatus?: Maybe<MilitaryVerificationStatusType>;
};

export type UpdateNotificationReminderInput = {
  id: Scalars['ID'];
  notificationReminderStatus: NotificationReminderStatus;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type UpdateReferralInput = {
  fromId: Scalars['ID'];
  status: ReferralStatus;
  timestamp: Scalars['AWSTimestamp'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type UpdateTransactionEventTransactionData = {
  __typename?: 'UpdateTransactionEventTransactionData';
  amount?: Maybe<Scalars['Float']>;
  brandId?: Maybe<Scalars['ID']>;
  cardId: Scalars['ID'];
  created?: Maybe<Scalars['AWSDateTime']>;
  currencyCode: CurrencyCodeType;
  id: Scalars['ID'];
  loyaltyProgramId?: Maybe<Scalars['String']>;
  matchingAmount?: Maybe<Scalars['Float']>;
  merchantCategoryCode?: Maybe<Scalars['String']>;
  moonbeamTransactionStatus?: Maybe<TransactionsStatus>;
  rewardAmount: Scalars['Float'];
  roundedAmount?: Maybe<Scalars['Float']>;
  roundingRuleId?: Maybe<Scalars['String']>;
  storeId?: Maybe<Scalars['ID']>;
};

export type UpdateTransactionInput = {
  id: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
  transactionId: Scalars['ID'];
  transactionStatus: TransactionsStatus;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type UpdateUserAuthSessionInput = {
  id: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type UpdatedTransactionEvent = {
  __typename?: 'UpdatedTransactionEvent';
  callbackUrl: Scalars['String'];
  data: UpdatedTransactionEventData;
  id: Scalars['ID'];
  subscriptionId: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
  topic: Scalars['String'];
};

export type UpdatedTransactionEventData = {
  __typename?: 'UpdatedTransactionEventData';
  cardId: Scalars['ID'];
  memberId: Scalars['ID'];
  redeemedMatchings: Array<Maybe<Scalars['String']>>;
  transaction: UpdateTransactionEventTransactionData;
  webhookEventType: Scalars['String'];
};

export type UpdatedTransactionEventResponse = {
  __typename?: 'UpdatedTransactionEventResponse';
  data?: Maybe<UpdatedTransactionEvent>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
};

export type UserAuthSession = {
  __typename?: 'UserAuthSession';
  createdAt: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  numberOfSessions: Scalars['Int'];
  updatedAt: Scalars['AWSDateTime'];
};

export enum UserAuthSessionErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type UserAuthSessionResponse = {
  __typename?: 'UserAuthSessionResponse';
  data?: Maybe<UserAuthSession>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<UserAuthSessionErrorType>;
};

export type UserDetailsForNotifications = {
  __typename?: 'UserDetailsForNotifications';
  email: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  notificationChannelType: Array<Maybe<NotificationChannelType>>;
  notificationType: NotificationType;
};

export enum UserDeviceErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type UserDeviceResponse = {
  __typename?: 'UserDeviceResponse';
  data?: Maybe<PushDevice>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<UserDeviceErrorType>;
};

export enum UserDeviceState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export type UserDevicesResponse = {
  __typename?: 'UserDevicesResponse';
  data?: Maybe<Array<Maybe<PushDevice>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<UserDeviceErrorType>;
};

export type UserForNotificationReminderResponse = {
  __typename?: 'UserForNotificationReminderResponse';
  data?: Maybe<Array<Maybe<RetrieveUserDetailsForNotifications>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationReminderErrorType>;
};

export type UserFromReferralInput = {
  referralCode: Scalars['ID'];
};

export type UserFromReferralResponse = {
  __typename?: 'UserFromReferralResponse';
  data?: Maybe<Scalars['ID']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<ReferralErrorType>;
};

export type UserNotificationAssetsResponse = {
  __typename?: 'UserNotificationAssetsResponse';
  data?: Maybe<Array<Maybe<UserNotificationsAssets>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<NotificationsErrorType>;
};

export type UserNotificationsAssets = {
  __typename?: 'UserNotificationsAssets';
  email: Scalars['String'];
  id: Scalars['ID'];
  pushToken: Scalars['String'];
};

export enum UtilitiesErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  RestrictedAccess = 'RESTRICTED_ACCESS',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type UpdateDailyEarningsSummaryMutationVariables = Exact<{
  updateDailyEarningsSummaryInput: UpdateDailyEarningsSummaryInput;
}>;


export type UpdateDailyEarningsSummaryMutation = { __typename?: 'Mutation', updateDailyEarningsSummary: { __typename?: 'DailyEarningsSummaryResponse', errorMessage?: string | null, errorType?: DailySummaryErrorType | null, data?: Array<{ __typename?: 'DailyEarningsSummary', id: string, dailyEarningsSummaryID: string, createdAt: string, updatedAt: string, status: DailyEarningsSummaryStatus, transactions: Array<{ __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null> } | null> | null } };

export type CreateDailyEarningsSummaryMutationVariables = Exact<{
  createDailyEarningsSummaryInput: CreateDailyEarningsSummaryInput;
}>;


export type CreateDailyEarningsSummaryMutation = { __typename?: 'Mutation', createDailyEarningsSummary: { __typename?: 'DailyEarningsSummaryResponse', errorMessage?: string | null, errorType?: DailySummaryErrorType | null, data?: Array<{ __typename?: 'DailyEarningsSummary', id: string, dailyEarningsSummaryID: string, createdAt: string, updatedAt: string, status: DailyEarningsSummaryStatus, transactions: Array<{ __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null> } | null> | null } };

export type AcknowledgeLocationUpdateMutationVariables = Exact<{
  createLocationBasedOfferReminderInput: CreateLocationBasedOfferReminderInput;
}>;


export type AcknowledgeLocationUpdateMutation = { __typename?: 'Mutation', acknowledgeLocationUpdate: { __typename?: 'LocationBasedOfferReminderResponse', errorMessage?: string | null, errorType?: NotificationsErrorType | null, data?: NotificationStatus | null } };

export type CreateEventSeriesMutationVariables = Exact<{
  createEventSeriesInput: CreateEventSeriesInput;
}>;


export type CreateEventSeriesMutation = { __typename?: 'Mutation', createEventSeries: { __typename?: 'EventSeriesResponse', errorMessage?: string | null, errorType?: EventsErrorType | null, data?: Array<{ __typename?: 'EventSeries', id: string, externalSeriesID: string, externalOrgID: string, name: string, title: string, description: string, createdAt: string, updatedAt: string, seriesLogoUrlSm: string, seriesLogoUrlBg: string, status: EventSeriesStatus, events: Array<{ __typename?: 'Event', id: string, externalEventID: string, title: string, description: string, eventLogoUrlSm: string, eventLogoUrlBg: string, registrationUrl: string, startTime: { __typename?: 'EventStartDateTime', timezone: string, startsAtLocal: string, startsAtUTC: string }, endTime: { __typename?: 'EventEndDateTime', timezone: string, endsAtLocal: string, endsAtUTC: string } } | null> } | null> | null } };

export type CreateServicePartnerMutationVariables = Exact<{
  createPartnerInput: CreatePartnerInput;
}>;


export type CreateServicePartnerMutation = { __typename?: 'Mutation', createServicePartner: { __typename?: 'PartnerResponse', errorMessage?: string | null, errorType?: ServicesErrorType | null, data?: Array<{ __typename?: 'Partner', id: string, status: ServicePartnerStatus, createdAt: string, updatedAt: string, name: string, shortDescription: string, description: string, isOnline: boolean, logoUrl: string, addressLine: string, city: string, state: string, zipCode: string, website: string, email?: string | null, phoneNumber?: string | null, services: Array<{ __typename?: 'Service', title: string, description: string } | null> } | null> | null } };

export type CreateReimbursementMutationVariables = Exact<{
  createReimbursementInput: CreateReimbursementInput;
}>;


export type CreateReimbursementMutation = { __typename?: 'Mutation', createReimbursement: { __typename?: 'ReimbursementResponse', errorMessage?: string | null, errorType?: ReimbursementsErrorType | null, data?: Array<{ __typename?: 'Reimbursement', id: string, timestamp: number, reimbursementId: string, createdAt: string, updatedAt: string, status: ReimbursementStatus, amount: number, cardId: string, cardLast4: string, cardType: CardType, transactions: Array<{ __typename?: 'Transaction', id?: string | null, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt?: string | null, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount?: number | null, totalAmount?: number | null, pendingCashbackAmount?: number | null, creditedCashbackAmount?: number | null, transactionBrandName?: string | null, transactionBrandAddress?: string | null, transactionBrandLogoUrl?: string | null, transactionBrandURLAddress?: string | null, transactionIsOnline?: boolean | null } | null> } | null> | null } };

export type CreateAppReviewMutationVariables = Exact<{
  createAppReviewInput: CreateAppReviewInput;
}>;


export type CreateAppReviewMutation = { __typename?: 'Mutation', createAppReview: { __typename?: 'AppReviewResponse', errorMessage?: string | null, errorType?: AppReviewErrorType | null, data?: { __typename?: 'AppReview', id: string, createdAt: string, updatedAt: string } | null } };

export type PutMilitaryVerificationReportMutationVariables = Exact<{
  putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput;
}>;


export type PutMilitaryVerificationReportMutation = { __typename?: 'Mutation', putMilitaryVerificationReport: { __typename?: 'MilitaryVerificationReportResponse', errorMessage?: string | null, errorType?: StorageErrorType | null, data?: string | null } };

export type CreateLogEventMutationVariables = Exact<{
  createLogEventInput: CreateLogEventInput;
}>;


export type CreateLogEventMutation = { __typename?: 'Mutation', createLogEvent: { __typename?: 'LoggingResponse', errorMessage?: string | null, errorType?: LoggingErrorType | null, data?: LoggingAcknowledgmentType | null } };

export type CreateReferralMutationVariables = Exact<{
  createReferralInput: CreateReferralInput;
}>;


export type CreateReferralMutation = { __typename?: 'Mutation', createReferral: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', fromId: string, timestamp: number, toId: string, campaignCode: MarketingCampaignCode, createdAt: string, updatedAt: string, status: ReferralStatus } | null> | null } };

export type UpdateReferralMutationVariables = Exact<{
  updateReferralInput: UpdateReferralInput;
}>;


export type UpdateReferralMutation = { __typename?: 'Mutation', updateReferral: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', fromId: string, timestamp: number, toId: string, campaignCode: MarketingCampaignCode, createdAt: string, updatedAt: string, status: ReferralStatus } | null> | null } };

export type CreateNotificationReminderMutationVariables = Exact<{
  createNotificationReminderInput: CreateNotificationReminderInput;
}>;


export type CreateNotificationReminderMutation = { __typename?: 'Mutation', createNotificationReminder: { __typename?: 'NotificationReminderResponse', errorMessage?: string | null, errorType?: NotificationReminderErrorType | null, data?: Array<{ __typename?: 'NotificationReminder', id: string, notificationReminderType: NotificationReminderType, notificationReminderStatus: NotificationReminderStatus, notificationReminderCadence: NotificationReminderCadence, createdAt: string, updatedAt: string, nextTriggerAt: string, notificationChannelType: Array<NotificationChannelType | null>, notificationReminderCount: number, notificationReminderMaxCount: number } | null> | null } };

export type UpdateNotificationReminderMutationVariables = Exact<{
  updateNotificationReminderInput: UpdateNotificationReminderInput;
}>;


export type UpdateNotificationReminderMutation = { __typename?: 'Mutation', updateNotificationReminder: { __typename?: 'NotificationReminderResponse', errorMessage?: string | null, errorType?: NotificationReminderErrorType | null, data?: Array<{ __typename?: 'NotificationReminder', id: string, notificationReminderType: NotificationReminderType, notificationReminderStatus: NotificationReminderStatus, notificationReminderCadence: NotificationReminderCadence, createdAt: string, updatedAt: string, nextTriggerAt: string, notificationChannelType: Array<NotificationChannelType | null>, notificationReminderCount: number, notificationReminderMaxCount: number } | null> | null } };

export type CreateUserAuthSessionMutationVariables = Exact<{
  createUserAuthSessionInput: CreateUserAuthSessionInput;
}>;


export type CreateUserAuthSessionMutation = { __typename?: 'Mutation', createUserAuthSession: { __typename?: 'UserAuthSessionResponse', errorMessage?: string | null, errorType?: UserAuthSessionErrorType | null, data?: { __typename?: 'UserAuthSession', id: string, createdAt: string, updatedAt: string, numberOfSessions: number } | null } };

export type UpdateUserAuthSessionMutationVariables = Exact<{
  updateUserAuthSessionInput: UpdateUserAuthSessionInput;
}>;


export type UpdateUserAuthSessionMutation = { __typename?: 'Mutation', updateUserAuthSession: { __typename?: 'UserAuthSessionResponse', errorMessage?: string | null, errorType?: UserAuthSessionErrorType | null, data?: { __typename?: 'UserAuthSession', id: string, createdAt: string, updatedAt: string, numberOfSessions: number } | null } };

export type CreateFaqMutationVariables = Exact<{
  createFAQInput: CreateFaqInput;
}>;


export type CreateFaqMutation = { __typename?: 'Mutation', createFAQ: { __typename?: 'FAQResponse', errorMessage?: string | null, errorType?: FaqErrorType | null, data?: Array<{ __typename?: 'FAQ', id: string, title: string, createdAt: string, updatedAt: string, facts: Array<{ __typename?: 'Fact', description: string, linkableKeyword?: string | null, linkLocation?: string | null, type: FactType } | null> } | null> | null } };

export type CreateDeviceMutationVariables = Exact<{
  createDeviceInput: CreateDeviceInput;
}>;


export type CreateDeviceMutation = { __typename?: 'Mutation', createDevice: { __typename?: 'UserDeviceResponse', errorType?: UserDeviceErrorType | null, errorMessage?: string | null, data?: { __typename?: 'PushDevice', id: string, tokenId: string, deviceState: UserDeviceState, lastLoginDate: string } | null } };

export type CreateBulkNotificationMutationVariables = Exact<{
  createBulkNotificationInput: CreateBulkNotificationInput;
}>;


export type CreateBulkNotificationMutation = { __typename?: 'Mutation', createBulkNotification: { __typename?: 'CreateBulkNotificationResponse', errorType?: NotificationsErrorType | null, errorMessage?: string | null, data?: Array<{ __typename?: 'Notification', id: string, timestamp: number, notificationId: string, emailDestination?: string | null, userFullName?: string | null, type: NotificationType, channelType: NotificationChannelType, status: NotificationStatus, expoPushTokens?: Array<string | null> | null, pendingCashback?: number | null, merchantName?: string | null, actionUrl?: string | null, createdAt: string, updatedAt: string } | null> | null } };

export type CreateNotificationMutationVariables = Exact<{
  createNotificationInput: CreateNotificationInput;
}>;


export type CreateNotificationMutation = { __typename?: 'Mutation', createNotification: { __typename?: 'CreateNotificationResponse', errorType?: NotificationsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'Notification', id: string, timestamp: number, notificationId: string, emailDestination?: string | null, userFullName?: string | null, type: NotificationType, channelType: NotificationChannelType, status: NotificationStatus, expoPushTokens?: Array<string | null> | null, pendingCashback?: number | null, merchantName?: string | null, actionUrl?: string | null, createdAt: string, updatedAt: string } | null } };

export type CreateTransactionMutationVariables = Exact<{
  createTransactionInput: CreateTransactionInput;
}>;


export type CreateTransactionMutation = { __typename?: 'Mutation', createTransaction: { __typename?: 'MoonbeamTransactionResponse', errorType?: TransactionsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null } };

export type UpdateTransactionMutationVariables = Exact<{
  updateTransactionInput: UpdateTransactionInput;
}>;


export type UpdateTransactionMutation = { __typename?: 'Mutation', updateTransaction: { __typename?: 'MoonbeamUpdatedTransactionResponse', errorType?: TransactionsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'MoonbeamUpdatedTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, updatedAt: string } | null } };

export type CreateCardLinkMutationVariables = Exact<{
  createCardLinkInput: CreateCardLinkInput;
}>;


export type CreateCardLinkMutation = { __typename?: 'Mutation', createCardLink: { __typename?: 'CardLinkResponse', errorType?: CardLinkErrorType | null, errorMessage?: string | null, data?: { __typename?: 'CardLink', id: string, memberId: string, createdAt: string, updatedAt: string, status: CardLinkingStatus, cards: Array<{ __typename?: 'Card', id: string, applicationID: string, token: string, type: CardType, name: string, last4: string, expiration?: string | null, additionalProgramID?: string | null } | null> } | null } };

export type AddCardMutationVariables = Exact<{
  addCardInput: AddCardInput;
}>;


export type AddCardMutation = { __typename?: 'Mutation', addCard: { __typename?: 'CardLinkResponse', errorType?: CardLinkErrorType | null, errorMessage?: string | null, data?: { __typename?: 'CardLink', id: string, memberId: string, createdAt: string, updatedAt: string, status: CardLinkingStatus, cards: Array<{ __typename?: 'Card', id: string, applicationID: string, token: string, type: CardType, name: string, last4: string, expiration?: string | null, additionalProgramID?: string | null } | null> } | null } };

export type UpdateCardMutationVariables = Exact<{
  updateCardInput: UpdateCardInput;
}>;


export type UpdateCardMutation = { __typename?: 'Mutation', updateCard: { __typename?: 'EligibleLinkedUsersResponse', errorMessage?: string | null, errorType?: CardLinkErrorType | null, data?: Array<{ __typename?: 'EligibleLinkedUser', id: string, cardIds: Array<string | null>, memberId: string } | null> | null } };

export type DeleteCardMutationVariables = Exact<{
  deleteCardInput: DeleteCardInput;
}>;


export type DeleteCardMutation = { __typename?: 'Mutation', deleteCard: { __typename?: 'CardResponse', errorType?: CardLinkErrorType | null, errorMessage?: string | null, data?: { __typename?: 'CardUpdate', id: string, cardId: string, updatedAt: string } | null } };

export type CreateMilitaryVerificationMutationVariables = Exact<{
  createMilitaryVerificationInput: CreateMilitaryVerificationInput;
}>;


export type CreateMilitaryVerificationMutation = { __typename?: 'Mutation', createMilitaryVerification: { __typename?: 'CreateMilitaryVerificationResponse', errorType?: MilitaryVerificationErrorType | null, errorMessage?: string | null, data?: { __typename?: 'MilitaryVerificationInformation', id: string, firstName: string, lastName: string, dateOfBirth: string, enlistmentYear: string, addressLine: string, city: string, state: string, zipCode: string, createdAt: string, updatedAt: string, militaryDutyStatus: MilitaryDutyStatus, militaryBranch: MilitaryBranch, militaryAffiliation: MilitaryAffiliation, militaryVerificationStatus: MilitaryVerificationStatusType } | null } };

export type UpdateMilitaryVerificationStatusMutationVariables = Exact<{
  updateMilitaryVerificationInput: UpdateMilitaryVerificationInput;
}>;


export type UpdateMilitaryVerificationStatusMutation = { __typename?: 'Mutation', updateMilitaryVerificationStatus: { __typename?: 'UpdateMilitaryVerificationResponse', errorType?: MilitaryVerificationErrorType | null, errorMessage?: string | null, id?: string | null, militaryVerificationStatus?: MilitaryVerificationStatusType | null } };

export type GetUserNotificationAssetsQueryVariables = Exact<{
  getUserNotificationAssetsInput: GetUserNotificationAssetsInput;
}>;


export type GetUserNotificationAssetsQuery = { __typename?: 'Query', getUserNotificationAssets: { __typename?: 'UserNotificationAssetsResponse', errorMessage?: string | null, errorType?: NotificationsErrorType | null, data?: Array<{ __typename?: 'UserNotificationsAssets', id: string, email: string, pushToken: string } | null> | null } };

export type GetDailyEarningsSummaryQueryVariables = Exact<{
  getDailyEarningsSummaryInput: GetDailyEarningsSummaryInput;
}>;


export type GetDailyEarningsSummaryQuery = { __typename?: 'Query', getDailyEarningsSummary: { __typename?: 'DailyEarningsSummaryResponse', errorMessage?: string | null, errorType?: DailySummaryErrorType | null, data?: Array<{ __typename?: 'DailyEarningsSummary', id: string, dailyEarningsSummaryID: string, createdAt: string, updatedAt: string, status: DailyEarningsSummaryStatus, transactions: Array<{ __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null> } | null> | null } };

export type GetNotificationByTypeQueryVariables = Exact<{
  getNotificationByTypeInput: GetNotificationByTypeInput;
}>;


export type GetNotificationByTypeQuery = { __typename?: 'Query', getNotificationByType: { __typename?: 'GetNotificationByTypeResponse', errorMessage?: string | null, errorType?: NotificationsErrorType | null, data?: Array<{ __typename?: 'Notification', id: string, timestamp: number, notificationId: string, emailDestination?: string | null, userFullName?: string | null, type: NotificationType, channelType: NotificationChannelType, status: NotificationStatus, expoPushTokens?: Array<string | null> | null, pendingCashback?: number | null, merchantName?: string | null, actionUrl?: string | null, createdAt: string, updatedAt: string } | null> | null } };

export type GetReimbursementsQueryVariables = Exact<{
  getReimbursementsInput: GetReimbursementsInput;
}>;


export type GetReimbursementsQuery = { __typename?: 'Query', getReimbursements: { __typename?: 'ReimbursementResponse', errorMessage?: string | null, errorType?: ReimbursementsErrorType | null, data?: Array<{ __typename?: 'Reimbursement', id: string, timestamp: number, reimbursementId: string, createdAt: string, updatedAt: string, status: ReimbursementStatus, amount: number, cardId: string, cardLast4: string, cardType: CardType, transactions: Array<{ __typename?: 'Transaction', id?: string | null, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt?: string | null, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount?: number | null, totalAmount?: number | null, pendingCashbackAmount?: number | null, creditedCashbackAmount?: number | null, transactionBrandName?: string | null, transactionBrandAddress?: string | null, transactionBrandLogoUrl?: string | null, transactionBrandURLAddress?: string | null, transactionIsOnline?: boolean | null } | null> } | null> | null } };

export type GetLocationPredictionsQueryVariables = Exact<{
  getLocationPredictionsInput: GetLocationPredictionsInput;
}>;


export type GetLocationPredictionsQuery = { __typename?: 'Query', getLocationPredictions: { __typename?: 'GetLocationPredictionsResponse', errorMessage?: string | null, errorType?: UtilitiesErrorType | null, data?: Array<{ __typename?: 'LocationPredictionType', description?: string | null, place_id?: string | null, reference?: string | null, matched_substrings?: string | null, structured_formatting?: string | null, address_components?: string | null, terms?: string | null, types?: Array<string | null> | null } | null> | null } };

export type GetAppReviewEligibilityQueryVariables = Exact<{
  getAppReviewEligibilityInput: GetAppReviewEligibilityInput;
}>;


export type GetAppReviewEligibilityQuery = { __typename?: 'Query', getAppReviewEligibility: { __typename?: 'GetAppReviewEligibilityResponse', errorMessage?: string | null, errorType?: AppReviewErrorType | null, data?: boolean | null } };

export type GetFilesForUserQueryVariables = Exact<{
  getFilesForUserInput: GetFilesForUserInput;
}>;


export type GetFilesForUserQuery = { __typename?: 'Query', getFilesForUser: { __typename?: 'FilesForUserResponse', errorMessage?: string | null, errorType?: StorageErrorType | null, data?: Array<string | null> | null } };

export type GetMilitaryVerificationInformationQueryVariables = Exact<{
  getMilitaryVerificationInformationInput: GetMilitaryVerificationInformationInput;
}>;


export type GetMilitaryVerificationInformationQuery = { __typename?: 'Query', getMilitaryVerificationInformation: { __typename?: 'MilitaryVerificationReportingInformationResponse', errorMessage?: string | null, errorType?: MilitaryVerificationReportingErrorType | null, data?: Array<{ __typename?: 'MilitaryVerificationReportingInformation', id: string, firstName: string, lastName: string, dateOfBirth: string, enlistmentYear: string, addressLine: string, city: string, state: string, zipCode: string, createdAt: string, updatedAt: string, militaryDutyStatus: MilitaryDutyStatus, militaryBranch: MilitaryBranch, militaryAffiliation: MilitaryAffiliation, militaryVerificationStatus: MilitaryVerificationStatusType } | null> | null } };

export type GetUserCardLinkingIdQueryVariables = Exact<{
  getUserCardLinkingIdInput: GetUserCardLinkingIdInput;
}>;


export type GetUserCardLinkingIdQuery = { __typename?: 'Query', getUserCardLinkingId: { __typename?: 'GetUserCardLinkingIdResponse', errorMessage?: string | null, errorType?: CardLinkErrorType | null, data?: string | null } };

export type GetUserFromReferralQueryVariables = Exact<{
  getUserFromRefferalInput: UserFromReferralInput;
}>;


export type GetUserFromReferralQuery = { __typename?: 'Query', getUserFromReferral: { __typename?: 'UserFromReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: string | null } };

export type GetReferralsByStatusQueryVariables = Exact<{
  getReferralsByStatusInput: GetReferralsByStatusInput;
}>;


export type GetReferralsByStatusQuery = { __typename?: 'Query', getReferralsByStatus: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', fromId: string, timestamp: number, toId: string, campaignCode: MarketingCampaignCode, createdAt: string, updatedAt: string, status: ReferralStatus } | null> | null } };

export type GetAppUpgradeCredentialsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAppUpgradeCredentialsQuery = { __typename?: 'Query', getAppUpgradeCredentials: { __typename?: 'AppUpgradeResponse', errorMessage?: string | null, errorType?: AppUpgradeErrorType | null, data?: string | null } };

export type GetUserAuthSessionQueryVariables = Exact<{
  getUserAuthSessionInput: GetUserAuthSessionInput;
}>;


export type GetUserAuthSessionQuery = { __typename?: 'Query', getUserAuthSession: { __typename?: 'UserAuthSessionResponse', errorMessage?: string | null, errorType?: UserAuthSessionErrorType | null, data?: { __typename?: 'UserAuthSession', id: string, createdAt: string, updatedAt: string, numberOfSessions: number } | null } };

export type GetNotificationRemindersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNotificationRemindersQuery = { __typename?: 'Query', getNotificationReminders: { __typename?: 'NotificationReminderResponse', errorMessage?: string | null, errorType?: NotificationReminderErrorType | null, data?: Array<{ __typename?: 'NotificationReminder', id: string, notificationReminderType: NotificationReminderType, notificationReminderStatus: NotificationReminderStatus, notificationReminderCadence: NotificationReminderCadence, createdAt: string, updatedAt: string, nextTriggerAt: string, notificationChannelType: Array<NotificationChannelType | null>, notificationReminderCount: number, notificationReminderMaxCount: number } | null> | null } };

export type GetAllUsersForNotificationRemindersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllUsersForNotificationRemindersQuery = { __typename?: 'Query', getAllUsersForNotificationReminders: { __typename?: 'UserForNotificationReminderResponse', errorMessage?: string | null, errorType?: NotificationReminderErrorType | null, data?: Array<{ __typename?: 'RetrieveUserDetailsForNotifications', id: string, email: string, firstName: string, lastName: string } | null> | null } };

export type GetAllUsersEligibleForReimbursementsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllUsersEligibleForReimbursementsQuery = { __typename?: 'Query', getAllUsersEligibleForReimbursements: { __typename?: 'UserForNotificationReminderResponse', errorMessage?: string | null, errorType?: NotificationReminderErrorType | null, data?: Array<{ __typename?: 'RetrieveUserDetailsForNotifications', id: string, email: string, firstName: string, lastName: string } | null> | null } };

export type GetAllUsersIneligibleForReimbursementsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllUsersIneligibleForReimbursementsQuery = { __typename?: 'Query', getAllUsersIneligibleForReimbursements: { __typename?: 'UserForNotificationReminderResponse', errorMessage?: string | null, errorType?: NotificationReminderErrorType | null, data?: Array<{ __typename?: 'RetrieveUserDetailsForNotifications', id: string, email: string, firstName: string, lastName: string } | null> | null } };

export type GetUsersByGeographyForNotificationRemindersQueryVariables = Exact<{
  getUsersByGeographicalLocationInput: GetUsersByGeographicalLocationInput;
}>;


export type GetUsersByGeographyForNotificationRemindersQuery = { __typename?: 'Query', getUsersByGeographyForNotificationReminders: { __typename?: 'UserForNotificationReminderResponse', errorMessage?: string | null, errorType?: NotificationReminderErrorType | null, data?: Array<{ __typename?: 'RetrieveUserDetailsForNotifications', id: string, email: string, firstName: string, lastName: string } | null> | null } };

export type GeoCodeAsyncQueryVariables = Exact<{
  geocodeAsyncInput: GeocodeAsyncInput;
}>;


export type GeoCodeAsyncQuery = { __typename?: 'Query', geoCodeAsync: { __typename?: 'GeocodeAsyncResponse', errorMessage?: string | null, errorType?: UtilitiesErrorType | null, data?: Array<{ __typename?: 'Location', latitude: number, longitude: number } | null> | null } };

export type GetFaQsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFaQsQuery = { __typename?: 'Query', getFAQs: { __typename?: 'FAQResponse', errorMessage?: string | null, errorType?: FaqErrorType | null, data?: Array<{ __typename?: 'FAQ', id: string, title: string, createdAt: string, updatedAt: string, facts: Array<{ __typename?: 'Fact', description: string, linkableKeyword?: string | null, linkLocation?: string | null, type: FactType } | null> } | null> | null } };

export type GetEventSeriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventSeriesQuery = { __typename?: 'Query', getEventSeries: { __typename?: 'EventSeriesResponse', errorMessage?: string | null, errorType?: EventsErrorType | null, data?: Array<{ __typename?: 'EventSeries', id: string, externalSeriesID: string, externalOrgID: string, name: string, title: string, description: string, createdAt: string, updatedAt: string, seriesLogoUrlSm: string, seriesLogoUrlBg: string, status: EventSeriesStatus, events: Array<{ __typename?: 'Event', id: string, externalEventID: string, title: string, description: string, eventLogoUrlSm: string, eventLogoUrlBg: string, registrationUrl: string, startTime: { __typename?: 'EventStartDateTime', timezone: string, startsAtLocal: string, startsAtUTC: string }, endTime: { __typename?: 'EventEndDateTime', timezone: string, endsAtLocal: string, endsAtUTC: string } } | null> } | null> | null } };

export type GetServicePartnersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetServicePartnersQuery = { __typename?: 'Query', getServicePartners: { __typename?: 'PartnerResponse', errorMessage?: string | null, errorType?: ServicesErrorType | null, data?: Array<{ __typename?: 'Partner', id: string, status: ServicePartnerStatus, createdAt: string, updatedAt: string, name: string, shortDescription: string, description: string, isOnline: boolean, logoUrl: string, addressLine: string, city: string, state: string, zipCode: string, website: string, email?: string | null, phoneNumber?: string | null, services: Array<{ __typename?: 'Service', title: string, description: string } | null> } | null> | null } };

export type GetFidelisPartnersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFidelisPartnersQuery = { __typename?: 'Query', getFidelisPartners: { __typename?: 'FidelisPartnerResponse', errorMessage?: string | null, errorType?: OffersErrorType | null, data?: Array<{ __typename?: 'FidelisPartner', brandName: string, veteranOwned: boolean, numberOfOffers: number, offers: Array<{ __typename?: 'Offer', id?: string | null, corporateId?: string | null, created?: string | null, offerState?: OfferState | null, availability?: OfferAvailability | null, brandId?: string | null, brandDba?: string | null, brandLogo?: string | null, brandLogoSm?: string | null, brandBanner?: string | null, brandParentCategory?: string | null, brandStubCopy?: string | null, brandWebsite?: string | null, description?: string | null, reach?: OfferReach | null, title?: string | null, qualifier?: string | null, tile?: string | null, startDate?: string | null, endDate?: string | null, currency?: CurrencyCodeType | null, extOfferId?: string | null, supplierOfferKey?: string | null, redemptionType?: RedemptionType | null, redemptionInstructionUrl?: string | null, redemptionTrigger?: RedemptionTrigger | null, budget?: number | null, daysAvailability?: Array<number | null> | null, stores?: Array<string | null> | null, totalRedeemLimit?: number | null, redeemLimitPerUser?: number | null, purchaseAmount?: number | null, purchaseFrequency?: number | null, storeDetails?: Array<{ __typename?: 'OfferStore', id?: string | null, name?: string | null, phone?: string | null, address1?: string | null, city?: string | null, state?: string | null, countryCode?: CountryCode | null, postCode?: string | null, isOnline?: boolean | null, distance?: number | null, geoLocation?: { __typename?: 'OfferStoreGeoLocation', latitude?: number | null, longitude?: number | null } | null } | null> | null, reward?: { __typename?: 'Reward', type?: RewardType | null, value?: number | null, maxValue?: number | null } | null } | null> } | null> | null } };

export type SearchOffersQueryVariables = Exact<{
  searchOffersInput: SearchOffersInput;
}>;


export type SearchOffersQuery = { __typename?: 'Query', searchOffers: { __typename?: 'OffersResponse', errorMessage?: string | null, errorType?: OffersErrorType | null, data?: { __typename?: 'OffersPaginatedResponse', totalNumberOfPages: number, totalNumberOfRecords: number, offers: Array<{ __typename?: 'Offer', id?: string | null, corporateId?: string | null, created?: string | null, offerState?: OfferState | null, availability?: OfferAvailability | null, brandId?: string | null, brandDba?: string | null, brandLogo?: string | null, brandLogoSm?: string | null, brandBanner?: string | null, brandParentCategory?: string | null, brandStubCopy?: string | null, brandWebsite?: string | null, description?: string | null, reach?: OfferReach | null, title?: string | null, qualifier?: string | null, tile?: string | null, startDate?: string | null, endDate?: string | null, currency?: CurrencyCodeType | null, extOfferId?: string | null, supplierOfferKey?: string | null, redemptionType?: RedemptionType | null, redemptionInstructionUrl?: string | null, redemptionTrigger?: RedemptionTrigger | null, budget?: number | null, daysAvailability?: Array<number | null> | null, stores?: Array<string | null> | null, totalRedeemLimit?: number | null, redeemLimitPerUser?: number | null, purchaseAmount?: number | null, purchaseFrequency?: number | null, storeDetails?: Array<{ __typename?: 'OfferStore', id?: string | null, name?: string | null, phone?: string | null, address1?: string | null, city?: string | null, state?: string | null, countryCode?: CountryCode | null, postCode?: string | null, isOnline?: boolean | null, distance?: number | null, geoLocation?: { __typename?: 'OfferStoreGeoLocation', latitude?: number | null, longitude?: number | null } | null } | null> | null, reward?: { __typename?: 'Reward', type?: RewardType | null, value?: number | null, maxValue?: number | null } | null } | null> } | null } };

export type GetOffersQueryVariables = Exact<{
  getOffersInput: GetOffersInput;
}>;


export type GetOffersQuery = { __typename?: 'Query', getOffers: { __typename?: 'OffersResponse', errorMessage?: string | null, errorType?: OffersErrorType | null, data?: { __typename?: 'OffersPaginatedResponse', totalNumberOfPages: number, totalNumberOfRecords: number, offers: Array<{ __typename?: 'Offer', id?: string | null, corporateId?: string | null, created?: string | null, offerState?: OfferState | null, availability?: OfferAvailability | null, brandId?: string | null, brandDba?: string | null, brandLogo?: string | null, brandLogoSm?: string | null, brandBanner?: string | null, brandParentCategory?: string | null, brandStubCopy?: string | null, brandWebsite?: string | null, description?: string | null, reach?: OfferReach | null, title?: string | null, qualifier?: string | null, tile?: string | null, startDate?: string | null, endDate?: string | null, currency?: CurrencyCodeType | null, extOfferId?: string | null, supplierOfferKey?: string | null, redemptionType?: RedemptionType | null, redemptionInstructionUrl?: string | null, redemptionTrigger?: RedemptionTrigger | null, budget?: number | null, daysAvailability?: Array<number | null> | null, stores?: Array<string | null> | null, totalRedeemLimit?: number | null, redeemLimitPerUser?: number | null, purchaseAmount?: number | null, purchaseFrequency?: number | null, storeDetails?: Array<{ __typename?: 'OfferStore', id?: string | null, name?: string | null, phone?: string | null, address1?: string | null, city?: string | null, state?: string | null, countryCode?: CountryCode | null, postCode?: string | null, isOnline?: boolean | null, distance?: number | null, geoLocation?: { __typename?: 'OfferStoreGeoLocation', latitude?: number | null, longitude?: number | null } | null } | null> | null, reward?: { __typename?: 'Reward', type?: RewardType | null, value?: number | null, maxValue?: number | null } | null } | null> } | null } };

export type GetSeasonalOffersQueryVariables = Exact<{
  getOffersInput: GetOffersInput;
}>;


export type GetSeasonalOffersQuery = { __typename?: 'Query', getSeasonalOffers: { __typename?: 'OffersResponse', errorMessage?: string | null, errorType?: OffersErrorType | null, data?: { __typename?: 'OffersPaginatedResponse', totalNumberOfPages: number, totalNumberOfRecords: number, offers: Array<{ __typename?: 'Offer', id?: string | null, corporateId?: string | null, created?: string | null, offerState?: OfferState | null, availability?: OfferAvailability | null, brandId?: string | null, brandDba?: string | null, brandLogo?: string | null, brandLogoSm?: string | null, brandBanner?: string | null, brandParentCategory?: string | null, brandStubCopy?: string | null, brandWebsite?: string | null, description?: string | null, reach?: OfferReach | null, title?: string | null, qualifier?: string | null, tile?: string | null, startDate?: string | null, endDate?: string | null, currency?: CurrencyCodeType | null, extOfferId?: string | null, supplierOfferKey?: string | null, redemptionType?: RedemptionType | null, redemptionInstructionUrl?: string | null, redemptionTrigger?: RedemptionTrigger | null, budget?: number | null, daysAvailability?: Array<number | null> | null, stores?: Array<string | null> | null, totalRedeemLimit?: number | null, redeemLimitPerUser?: number | null, purchaseAmount?: number | null, purchaseFrequency?: number | null, storeDetails?: Array<{ __typename?: 'OfferStore', id?: string | null, name?: string | null, phone?: string | null, address1?: string | null, city?: string | null, state?: string | null, countryCode?: CountryCode | null, postCode?: string | null, isOnline?: boolean | null, distance?: number | null, geoLocation?: { __typename?: 'OfferStoreGeoLocation', latitude?: number | null, longitude?: number | null } | null } | null> | null, reward?: { __typename?: 'Reward', type?: RewardType | null, value?: number | null, maxValue?: number | null } | null } | null> } | null } };

export type GetPremierOffersQueryVariables = Exact<{
  getOffersInput: GetOffersInput;
}>;


export type GetPremierOffersQuery = { __typename?: 'Query', getPremierOffers: { __typename?: 'OffersResponse', errorMessage?: string | null, errorType?: OffersErrorType | null, data?: { __typename?: 'OffersPaginatedResponse', totalNumberOfPages: number, totalNumberOfRecords: number, offers: Array<{ __typename?: 'Offer', id?: string | null, corporateId?: string | null, created?: string | null, offerState?: OfferState | null, availability?: OfferAvailability | null, brandId?: string | null, brandDba?: string | null, brandLogo?: string | null, brandLogoSm?: string | null, brandBanner?: string | null, brandParentCategory?: string | null, brandStubCopy?: string | null, brandWebsite?: string | null, description?: string | null, reach?: OfferReach | null, title?: string | null, qualifier?: string | null, tile?: string | null, startDate?: string | null, endDate?: string | null, currency?: CurrencyCodeType | null, extOfferId?: string | null, supplierOfferKey?: string | null, redemptionType?: RedemptionType | null, redemptionInstructionUrl?: string | null, redemptionTrigger?: RedemptionTrigger | null, budget?: number | null, daysAvailability?: Array<number | null> | null, stores?: Array<string | null> | null, totalRedeemLimit?: number | null, redeemLimitPerUser?: number | null, purchaseAmount?: number | null, purchaseFrequency?: number | null, storeDetails?: Array<{ __typename?: 'OfferStore', id?: string | null, name?: string | null, phone?: string | null, address1?: string | null, city?: string | null, state?: string | null, countryCode?: CountryCode | null, postCode?: string | null, isOnline?: boolean | null, distance?: number | null, geoLocation?: { __typename?: 'OfferStoreGeoLocation', latitude?: number | null, longitude?: number | null } | null } | null> | null, reward?: { __typename?: 'Reward', type?: RewardType | null, value?: number | null, maxValue?: number | null } | null } | null> } | null } };

export type GetAllDevicesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllDevicesQuery = { __typename?: 'Query', getAllDevices: { __typename?: 'UserDevicesResponse', errorMessage?: string | null, errorType?: UserDeviceErrorType | null, data?: Array<{ __typename?: 'PushDevice', id: string, tokenId: string, deviceState: UserDeviceState, lastLoginDate: string } | null> | null } };

export type GetDevicesForUserQueryVariables = Exact<{
  getDevicesForUserInput: GetDevicesForUserInput;
}>;


export type GetDevicesForUserQuery = { __typename?: 'Query', getDevicesForUser: { __typename?: 'UserDevicesResponse', errorMessage?: string | null, errorType?: UserDeviceErrorType | null, data?: Array<{ __typename?: 'PushDevice', id: string, tokenId: string, deviceState: UserDeviceState, lastLoginDate: string } | null> | null } };

export type GetTransactionsInRangeQueryVariables = Exact<{
  getTransactionsInRangeInput: GetTransactionsInRangeInput;
}>;


export type GetTransactionsInRangeQuery = { __typename?: 'Query', getTransactionsInRange: { __typename?: 'MoonbeamTransactionsResponse', errorMessage?: string | null, errorType?: TransactionsErrorType | null, data?: Array<{ __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null> | null } };

export type GetTransactionQueryVariables = Exact<{
  getTransactionInput: GetTransactionInput;
}>;


export type GetTransactionQuery = { __typename?: 'Query', getTransaction: { __typename?: 'MoonbeamTransactionsResponse', errorMessage?: string | null, errorType?: TransactionsErrorType | null, data?: Array<{ __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null> | null } };

export type GetTransactionByStatusQueryVariables = Exact<{
  getTransactionByStatusInput: GetTransactionByStatusInput;
}>;


export type GetTransactionByStatusQuery = { __typename?: 'Query', getTransactionByStatus: { __typename?: 'MoonbeamTransactionsByStatusResponse', errorMessage?: string | null, errorType?: TransactionsErrorType | null, data?: Array<{ __typename?: 'MoonbeamTransactionByStatus', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, creditedCashbackAmount: number, pendingCashbackAmount: number, rewardAmount: number, totalAmount: number } | null> | null } };

export type GetCardLinkQueryVariables = Exact<{
  getCardLinkInput: GetCardLinkInput;
}>;


export type GetCardLinkQuery = { __typename?: 'Query', getCardLink: { __typename?: 'CardLinkResponse', errorMessage?: string | null, errorType?: CardLinkErrorType | null, data?: { __typename?: 'CardLink', id: string, memberId: string, createdAt: string, updatedAt: string, status: CardLinkingStatus, cards: Array<{ __typename?: 'Card', id: string, applicationID: string, token: string, type: CardType, name: string, last4: string, expiration?: string | null, additionalProgramID?: string | null } | null> } | null } };

export type GetUsersWithNoCardsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersWithNoCardsQuery = { __typename?: 'Query', getUsersWithNoCards: { __typename?: 'IneligibleLinkedUsersResponse', errorMessage?: string | null, errorType?: CardLinkErrorType | null, data?: Array<{ __typename?: 'RetrieveUserDetailsForNotifications', id: string, email: string, firstName: string, lastName: string } | null> | null } };

export type GetEligibleLinkedUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEligibleLinkedUsersQuery = { __typename?: 'Query', getEligibleLinkedUsers: { __typename?: 'EligibleLinkedUsersResponse', errorMessage?: string | null, errorType?: CardLinkErrorType | null, data?: Array<{ __typename?: 'EligibleLinkedUser', id: string, cardIds: Array<string | null>, memberId: string } | null> | null } };

export type GetStorageQueryVariables = Exact<{
  getStorageInput: GetStorageInput;
}>;


export type GetStorageQuery = { __typename?: 'Query', getStorage: { __typename?: 'StorageResponse', errorMessage?: string | null, errorType?: StorageErrorType | null, data?: { __typename?: 'File', url: string } | null } };

export type GetMilitaryVerificationStatusQueryVariables = Exact<{
  getMilitaryVerificationInput: GetMilitaryVerificationInput;
}>;


export type GetMilitaryVerificationStatusQuery = { __typename?: 'Query', getMilitaryVerificationStatus: { __typename?: 'GetMilitaryVerificationResponse', errorMessage?: string | null, errorType?: MilitaryVerificationErrorType | null, data?: { __typename?: 'MilitaryVerificationStatus', id: string, militaryVerificationStatus: MilitaryVerificationStatusType } | null } };

export type UpdatedMilitaryVerificationStatusSubscriptionVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UpdatedMilitaryVerificationStatusSubscription = { __typename?: 'Subscription', updatedMilitaryVerificationStatus?: { __typename?: 'UpdateMilitaryVerificationResponse', errorType?: MilitaryVerificationErrorType | null, errorMessage?: string | null, id?: string | null, militaryVerificationStatus?: MilitaryVerificationStatusType | null } | null };

export type UpdatedTransactionSubscriptionVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UpdatedTransactionSubscription = { __typename?: 'Subscription', updatedTransaction?: { __typename?: 'MoonbeamUpdatedTransactionResponse', errorType?: TransactionsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'MoonbeamUpdatedTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, updatedAt: string } | null } | null };

export type CreatedTransactionSubscriptionVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CreatedTransactionSubscription = { __typename?: 'Subscription', createdTransaction?: { __typename?: 'MoonbeamTransactionResponse', errorType?: TransactionsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null } | null };
