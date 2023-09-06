export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
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
export type Card = {
    __typename?: 'Card';
    additionalProgramID?: Maybe<Scalars['String']>;
    applicationID: Scalars['ID'];
    id: Scalars['ID'];
    last4: Scalars['String'];
    name: Scalars['String'];
    token: Scalars['String'];
    type: CardType;
};
export type CardInput = {
    additionalProgramID?: InputMaybe<Scalars['String']>;
    applicationID?: InputMaybe<Scalars['ID']>;
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
export declare enum CardLinkErrorType {
    AlreadyExistent = "ALREADY_EXISTENT",
    InvalidCardScheme = "INVALID_CARD_SCHEME",
    NoneOrAbsent = "NONE_OR_ABSENT",
    UnexpectedError = "UNEXPECTED_ERROR",
    ValidationError = "VALIDATION_ERROR"
}
export type CardLinkResponse = {
    __typename?: 'CardLinkResponse';
    data?: Maybe<CardLink>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<CardLinkErrorType>;
};
export declare enum CardLinkingStatus {
    Linked = "LINKED",
    NotLinked = "NOT_LINKED"
}
export type CardResponse = {
    __typename?: 'CardResponse';
    data?: Maybe<CardUpdate>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<CardLinkErrorType>;
};
export declare enum CardType {
    Invalid = "INVALID",
    Mastercard = "MASTERCARD",
    Visa = "VISA"
}
export type CardUpdate = {
    __typename?: 'CardUpdate';
    cardId: Scalars['ID'];
    id: Scalars['ID'];
    updatedAt: Scalars['AWSDateTime'];
};
export declare enum CountryCode {
    Ca = "CA",
    Us = "US"
}
export type CreateCardLinkInput = {
    card: CardInput;
    createdAt?: InputMaybe<Scalars['AWSDateTime']>;
    id: Scalars['ID'];
    updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};
export type CreateDeviceInput = {
    deviceState: UserDeviceState;
    id: Scalars['ID'];
    lastLoginDate?: InputMaybe<Scalars['AWSDateTime']>;
    tokenId: Scalars['ID'];
};
export type CreateFaqInput = {
    createdAt?: InputMaybe<Scalars['AWSDateTime']>;
    facts: Array<InputMaybe<FactInput>>;
    id?: InputMaybe<Scalars['ID']>;
    title: Scalars['String'];
    updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
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
    emailDestination?: InputMaybe<Scalars['String']>;
    expoPushTokens?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
    id: Scalars['ID'];
    merchantName?: InputMaybe<Scalars['String']>;
    notificationId?: InputMaybe<Scalars['ID']>;
    pendingCashback?: InputMaybe<Scalars['Float']>;
    status: NotificationStatus;
    timestamp?: InputMaybe<Scalars['AWSTimestamp']>;
    type: NotificationType;
    updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
    userFullName?: InputMaybe<Scalars['String']>;
};
export type CreateNotificationResponse = {
    __typename?: 'CreateNotificationResponse';
    data?: Maybe<Notification>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<NotificationsErrorType>;
    id?: Maybe<Scalars['ID']>;
};
export type CreateReimbursementEligibilityInput = {
    createdAt?: InputMaybe<Scalars['AWSDateTime']>;
    eligibilityStatus: ReimbursementEligibilityStatus;
    id: Scalars['ID'];
    updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};
export type CreateReimbursementInput = {
    cardId: Scalars['ID'];
    clientId?: InputMaybe<Scalars['ID']>;
    createdAt?: InputMaybe<Scalars['AWSDateTime']>;
    creditedCashbackAmount: Scalars['Float'];
    currencyCode: CurrencyCodeType;
    id: Scalars['ID'];
    paymentGatewayId?: InputMaybe<Scalars['ID']>;
    pendingCashbackAmount: Scalars['Float'];
    processingMessage?: InputMaybe<Scalars['String']>;
    reimbursementId: Scalars['ID'];
    reimbursementStatus: ReimbursementStatus;
    succeeded?: InputMaybe<Scalars['Boolean']>;
    timestamp?: InputMaybe<Scalars['AWSTimestamp']>;
    transactions: Array<InputMaybe<ReimbursementTransactionInput>>;
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
export declare enum CurrencyCodeType {
    Usd = "USD"
}
export type DeleteCardInput = {
    cardId: Scalars['ID'];
    id: Scalars['ID'];
    memberId: Scalars['ID'];
    updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};
export type EligibleLinkedUser = {
    __typename?: 'EligibleLinkedUser';
    cardId: Scalars['ID'];
    id: Scalars['ID'];
    memberId: Scalars['ID'];
};
export type EligibleLinkedUsersResponse = {
    __typename?: 'EligibleLinkedUsersResponse';
    data?: Maybe<Array<Maybe<EligibleLinkedUser>>>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<CardLinkErrorType>;
};
export type Faq = {
    __typename?: 'FAQ';
    createdAt: Scalars['AWSDateTime'];
    facts: Array<Maybe<Fact>>;
    id: Scalars['ID'];
    title: Scalars['String'];
    updatedAt: Scalars['AWSDateTime'];
};
export declare enum FaqErrorType {
    DuplicateObjectFound = "DUPLICATE_OBJECT_FOUND",
    NoneOrAbsent = "NONE_OR_ABSENT",
    UnexpectedError = "UNEXPECTED_ERROR",
    ValidationError = "VALIDATION_ERROR"
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
export declare enum FactType {
    Linkable = "LINKABLE",
    NonLinkable = "NON_LINKABLE"
}
export type FidelisPartner = {
    __typename?: 'FidelisPartner';
    brandName: Scalars['String'];
    numberOfOffers: Scalars['Int'];
    offers: Array<Maybe<Offer>>;
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
export declare enum FileAccessLevel {
    Private = "PRIVATE",
    Protected = "PROTECTED",
    Public = "PUBLIC"
}
export declare enum FileType {
    Main = "MAIN"
}
export type GetCardLinkInput = {
    id: Scalars['ID'];
};
export type GetDeviceByTokenInput = {
    tokenId: Scalars['ID'];
};
export type GetDeviceInput = {
    id: Scalars['ID'];
    tokenId: Scalars['ID'];
};
export type GetDevicesForUserInput = {
    id: Scalars['ID'];
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
export type GetOffersInput = {
    availability: OfferAvailability;
    brandName?: InputMaybe<Scalars['String']>;
    countryCode: CountryCode;
    filterType: OfferFilter;
    offerStates: Array<InputMaybe<OfferState>>;
    pageNumber: Scalars['Int'];
    pageSize: Scalars['Int'];
    radius?: InputMaybe<Scalars['Int']>;
    radiusIncludeOnlineStores?: InputMaybe<Scalars['Boolean']>;
    radiusLatitude?: InputMaybe<Scalars['Float']>;
    radiusLongitude?: InputMaybe<Scalars['Float']>;
    redemptionType: RedemptionType;
};
export type GetReimbursementByStatusInput = {
    id: Scalars['ID'];
    reimbursementStatus: ReimbursementStatus;
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
export declare enum MilitaryAffiliation {
    FamilyChild = "FAMILY_CHILD",
    FamilyParent = "FAMILY_PARENT",
    FamilySibling = "FAMILY_SIBLING",
    FamilySpouse = "FAMILY_SPOUSE",
    ServiceMember = "SERVICE_MEMBER"
}
export declare enum MilitaryBranch {
    AirForce = "AIR_FORCE",
    Army = "ARMY",
    CoastGuard = "COAST_GUARD",
    MarineCorps = "MARINE_CORPS",
    Navy = "NAVY",
    SpaceForce = "SPACE_FORCE"
}
export declare enum MilitaryDutyStatus {
    ActiveDuty = "ACTIVE_DUTY",
    NationalGuard = "NATIONAL_GUARD",
    Reservist = "RESERVIST",
    Veteran = "VETERAN"
}
export declare enum MilitaryVerificationErrorType {
    NoneOrAbsent = "NONE_OR_ABSENT",
    UnexpectedError = "UNEXPECTED_ERROR",
    ValidationError = "VALIDATION_ERROR"
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
export type MilitaryVerificationStatus = {
    __typename?: 'MilitaryVerificationStatus';
    id: Scalars['ID'];
    militaryVerificationStatus: MilitaryVerificationStatusType;
};
export declare enum MilitaryVerificationStatusType {
    Pending = "PENDING",
    Rejected = "REJECTED",
    Verified = "VERIFIED"
}
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
    addCard: CardLinkResponse;
    createCardLink: CardLinkResponse;
    createDevice: UserDeviceResponse;
    createFAQ: FaqResponse;
    createMilitaryVerification: CreateMilitaryVerificationResponse;
    createNotification: CreateNotificationResponse;
    createReimbursement: ReimbursementResponse;
    createReimbursementEligibility: ReimbursementEligibilityResponse;
    createTransaction: MoonbeamTransactionResponse;
    deleteCard: CardResponse;
    updateDevice: UserDeviceResponse;
    updateMilitaryVerificationStatus: UpdateMilitaryVerificationResponse;
    updateReimbursement: ReimbursementResponse;
    updateReimbursementEligibility: ReimbursementEligibilityResponse;
    updateTransaction: MoonbeamUpdatedTransactionResponse;
};
export type MutationAddCardArgs = {
    addCardInput: AddCardInput;
};
export type MutationCreateCardLinkArgs = {
    createCardLinkInput: CreateCardLinkInput;
};
export type MutationCreateDeviceArgs = {
    createDeviceInput: CreateDeviceInput;
};
export type MutationCreateFaqArgs = {
    createFAQInput: CreateFaqInput;
};
export type MutationCreateMilitaryVerificationArgs = {
    createMilitaryVerificationInput: CreateMilitaryVerificationInput;
};
export type MutationCreateNotificationArgs = {
    createNotificationInput: CreateNotificationInput;
};
export type MutationCreateReimbursementArgs = {
    createReimbursementInput: CreateReimbursementInput;
};
export type MutationCreateReimbursementEligibilityArgs = {
    createReimbursementEligibilityInput: CreateReimbursementEligibilityInput;
};
export type MutationCreateTransactionArgs = {
    createTransactionInput: CreateTransactionInput;
};
export type MutationDeleteCardArgs = {
    deleteCardInput: DeleteCardInput;
};
export type MutationUpdateDeviceArgs = {
    updateDeviceInput: UpdateDeviceInput;
};
export type MutationUpdateMilitaryVerificationStatusArgs = {
    updateMilitaryVerificationInput: UpdateMilitaryVerificationInput;
};
export type MutationUpdateReimbursementArgs = {
    updateReimbursementInput: UpdateReimbursementInput;
};
export type MutationUpdateReimbursementEligibilityArgs = {
    updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput;
};
export type MutationUpdateTransactionArgs = {
    updateTransactionInput: UpdateTransactionInput;
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
export declare enum NotificationChannelType {
    Email = "EMAIL",
    Push = "PUSH",
    Sms = "SMS"
}
export type NotificationResponse = {
    __typename?: 'NotificationResponse';
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<NotificationsErrorType>;
    requestId?: Maybe<Scalars['ID']>;
};
export declare enum NotificationStatus {
    Acknowledged = "ACKNOWLEDGED",
    Sent = "SENT"
}
export declare enum NotificationType {
    EligibleForReimbursement = "ELIGIBLE_FOR_REIMBURSEMENT",
    ExpirationLinkedCardNotice = "EXPIRATION_LINKED_CARD_NOTICE",
    ExpiredLinkedCard = "EXPIRED_LINKED_CARD",
    MarketingRelated = "MARKETING_RELATED",
    NewQualifyingOfferAvailable = "NEW_QUALIFYING_OFFER_AVAILABLE",
    NewUserSignup = "NEW_USER_SIGNUP",
    QualifyingOffer = "QUALIFYING_OFFER"
}
export declare enum NotificationsErrorType {
    DuplicateObjectFound = "DUPLICATE_OBJECT_FOUND",
    NoneOrAbsent = "NONE_OR_ABSENT",
    UnexpectedError = "UNEXPECTED_ERROR",
    ValidationError = "VALIDATION_ERROR"
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
export declare enum OfferAvailability {
    ClientOnly = "client_only",
    Global = "global"
}
export declare enum OfferFilter {
    Fidelis = "FIDELIS",
    Nearby = "NEARBY",
    Online = "ONLINE"
}
export declare enum OfferReach {
    National = "national",
    OnlineOnly = "online_only",
    State = "state"
}
export declare enum OfferState {
    Active = "active",
    Archived = "archived",
    Expired = "expired",
    Paused = "paused",
    Pending = "pending",
    Scheduled = "scheduled"
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
export declare enum OffersErrorType {
    NoneOrAbsent = "NONE_OR_ABSENT",
    UnexpectedError = "UNEXPECTED_ERROR",
    ValidationError = "VALIDATION_ERROR"
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
export type PushDevice = {
    __typename?: 'PushDevice';
    deviceState: UserDeviceState;
    id: Scalars['ID'];
    lastLoginDate: Scalars['AWSDateTime'];
    tokenId: Scalars['ID'];
};
export type Query = {
    __typename?: 'Query';
    getCardLink: CardLinkResponse;
    getDevice: UserDeviceResponse;
    getDeviceByToken: UserDeviceResponse;
    getDevicesForUser: UserDevicesResponse;
    getEligibleLinkedUsers: EligibleLinkedUsersResponse;
    getFAQs: FaqResponse;
    getFidelisPartners: FidelisPartnerResponse;
    getMilitaryVerificationStatus: GetMilitaryVerificationResponse;
    getOffers: OffersResponse;
    getReimbursementByStatus: ReimbursementByStatusResponse;
    getStorage: StorageResponse;
    getTransaction: MoonbeamTransactionsResponse;
    getTransactionByStatus: MoonbeamTransactionsByStatusResponse;
};
export type QueryGetCardLinkArgs = {
    getCardLinkInput: GetCardLinkInput;
};
export type QueryGetDeviceArgs = {
    getDeviceInput: GetDeviceInput;
};
export type QueryGetDeviceByTokenArgs = {
    getDeviceByTokenInput: GetDeviceByTokenInput;
};
export type QueryGetDevicesForUserArgs = {
    getDevicesForUserInput: GetDevicesForUserInput;
};
export type QueryGetMilitaryVerificationStatusArgs = {
    getMilitaryVerificationInput: GetMilitaryVerificationInput;
};
export type QueryGetOffersArgs = {
    getOffersInput: GetOffersInput;
};
export type QueryGetReimbursementByStatusArgs = {
    getReimbursementByStatusInput: GetReimbursementByStatusInput;
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
export declare enum RedemptionTrigger {
    CumulativePurchaseAmount = "cumulative_purchase_amount",
    MinimumPurchaseAmount = "minimum_purchase_amount",
    PurchaseFrequency = "purchase_frequency"
}
export declare enum RedemptionType {
    Cardlinked = "cardlinked",
    Click = "click",
    Mobile = "mobile"
}
export type Reimbursement = {
    __typename?: 'Reimbursement';
    cardId: Scalars['ID'];
    clientId?: Maybe<Scalars['ID']>;
    createdAt: Scalars['AWSDateTime'];
    creditedCashbackAmount: Scalars['Float'];
    currencyCode: CurrencyCodeType;
    id: Scalars['ID'];
    paymentGatewayId?: Maybe<Scalars['ID']>;
    pendingCashbackAmount: Scalars['Float'];
    processingMessage?: Maybe<Scalars['String']>;
    reimbursementId: Scalars['ID'];
    reimbursementStatus: ReimbursementStatus;
    succeeded?: Maybe<Scalars['Boolean']>;
    timestamp: Scalars['AWSTimestamp'];
    transactions: Array<Maybe<ReimbursementTransaction>>;
    updatedAt: Scalars['AWSDateTime'];
};
export type ReimbursementByStatusResponse = {
    __typename?: 'ReimbursementByStatusResponse';
    data?: Maybe<Array<Maybe<Reimbursement>>>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<ReimbursementsErrorType>;
};
export type ReimbursementEligibility = {
    __typename?: 'ReimbursementEligibility';
    createdAt?: Maybe<Scalars['AWSDateTime']>;
    eligibilityStatus: ReimbursementEligibilityStatus;
    id: Scalars['ID'];
    updatedAt: Scalars['AWSDateTime'];
};
export type ReimbursementEligibilityResponse = {
    __typename?: 'ReimbursementEligibilityResponse';
    data?: Maybe<ReimbursementEligibility>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<ReimbursementsErrorType>;
    id?: Maybe<Scalars['ID']>;
};
export declare enum ReimbursementEligibilityStatus {
    Eligible = "ELIGIBLE",
    Ineligible = "INELIGIBLE"
}
export type ReimbursementResponse = {
    __typename?: 'ReimbursementResponse';
    data?: Maybe<Reimbursement>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<ReimbursementsErrorType>;
    id?: Maybe<Scalars['ID']>;
};
export declare enum ReimbursementStatus {
    Failed = "FAILED",
    Pending = "PENDING",
    Processed = "PROCESSED"
}
export type ReimbursementTransaction = {
    __typename?: 'ReimbursementTransaction';
    id: Scalars['ID'];
    timestamp: Scalars['AWSTimestamp'];
    transactionId: Scalars['ID'];
    transactionStatus: TransactionsStatus;
};
export type ReimbursementTransactionInput = {
    id: Scalars['ID'];
    timestamp: Scalars['AWSTimestamp'];
    transactionId: Scalars['ID'];
    transactionStatus: TransactionsStatus;
};
export declare enum ReimbursementsErrorType {
    DuplicateObjectFound = "DUPLICATE_OBJECT_FOUND",
    NoneOrAbsent = "NONE_OR_ABSENT",
    UnexpectedError = "UNEXPECTED_ERROR",
    Unprocessable = "UNPROCESSABLE",
    ValidationError = "VALIDATION_ERROR"
}
export type RemoveCardResponse = {
    __typename?: 'RemoveCardResponse';
    data?: Maybe<Scalars['Boolean']>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<CardLinkErrorType>;
};
export type Reward = {
    __typename?: 'Reward';
    maxValue?: Maybe<Scalars['Float']>;
    type?: Maybe<RewardType>;
    value?: Maybe<Scalars['Float']>;
};
export declare enum RewardType {
    RewardAmount = "reward_amount",
    RewardPercent = "reward_percent"
}
export type SendEmailNotificationInput = {
    emailDestination: Scalars['String'];
    userFullName: Scalars['String'];
};
export type SendMobilePushNotificationInput = {
    expoPushTokens: Array<InputMaybe<Scalars['String']>>;
    merchantName: Scalars['String'];
    pendingCashback: Scalars['Float'];
};
export declare enum StorageErrorType {
    DuplicateObjectFound = "DUPLICATE_OBJECT_FOUND",
    NoneOrAbsent = "NONE_OR_ABSENT",
    RestrictedAccess = "RESTRICTED_ACCESS",
    UnexpectedError = "UNEXPECTED_ERROR",
    ValidationError = "VALIDATION_ERROR"
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
};
export type SubscriptionCreatedTransactionArgs = {
    id: Scalars['ID'];
};
export type SubscriptionUpdatedMilitaryVerificationStatusArgs = {
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
export declare enum TransactionType {
    Contribution = "CONTRIBUTION",
    OfferRedeemed = "OFFER_REDEEMED",
    Roundup = "ROUNDUP"
}
export declare enum TransactionsErrorType {
    DuplicateObjectFound = "DUPLICATE_OBJECT_FOUND",
    NoneOrAbsent = "NONE_OR_ABSENT",
    UnexpectedError = "UNEXPECTED_ERROR",
    Unprocessable = "UNPROCESSABLE",
    ValidationError = "VALIDATION_ERROR"
}
export declare enum TransactionsStatus {
    Credited = "CREDITED",
    Pending = "PENDING",
    Processed = "PROCESSED",
    Rejected = "REJECTED"
}
export type UpdateDeviceInput = {
    deviceState: UserDeviceState;
    id: Scalars['ID'];
    lastLoginDate?: InputMaybe<Scalars['AWSDateTime']>;
    tokenId: Scalars['ID'];
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
export type UpdateReimbursementEligibilityInput = {
    eligibilityStatus: ReimbursementEligibilityStatus;
    id: Scalars['ID'];
    updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};
export type UpdateReimbursementInput = {
    clientId?: InputMaybe<Scalars['ID']>;
    creditedCashbackAmount?: InputMaybe<Scalars['Float']>;
    id: Scalars['ID'];
    paymentGatewayId?: InputMaybe<Scalars['ID']>;
    pendingCashbackAmount?: InputMaybe<Scalars['Float']>;
    processingMessage?: InputMaybe<Scalars['String']>;
    reimbursementStatus?: InputMaybe<ReimbursementStatus>;
    succeeded?: InputMaybe<Scalars['Boolean']>;
    timestamp: Scalars['AWSTimestamp'];
    transactions?: InputMaybe<Array<InputMaybe<ReimbursementTransactionInput>>>;
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
export declare enum UserDeviceErrorType {
    DuplicateObjectFound = "DUPLICATE_OBJECT_FOUND",
    NoneOrAbsent = "NONE_OR_ABSENT",
    UnexpectedError = "UNEXPECTED_ERROR",
    ValidationError = "VALIDATION_ERROR"
}
export type UserDeviceResponse = {
    __typename?: 'UserDeviceResponse';
    data?: Maybe<PushDevice>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<UserDeviceErrorType>;
};
export declare enum UserDeviceState {
    Active = "ACTIVE",
    Inactive = "INACTIVE"
}
export type UserDevicesResponse = {
    __typename?: 'UserDevicesResponse';
    data?: Maybe<Array<Maybe<PushDevice>>>;
    errorMessage?: Maybe<Scalars['String']>;
    errorType?: Maybe<UserDeviceErrorType>;
};
export type CreateFaqMutationVariables = Exact<{
    createFAQInput: CreateFaqInput;
}>;
export type CreateFaqMutation = {
    __typename?: 'Mutation';
    createFAQ: {
        __typename?: 'FAQResponse';
        errorMessage?: string | null;
        errorType?: FaqErrorType | null;
        data?: Array<{
            __typename?: 'FAQ';
            id: string;
            title: string;
            createdAt: string;
            updatedAt: string;
            facts: Array<{
                __typename?: 'Fact';
                description: string;
                linkableKeyword?: string | null;
                linkLocation?: string | null;
                type: FactType;
            } | null>;
        } | null> | null;
    };
};
export type CreateDeviceMutationVariables = Exact<{
    createDeviceInput: CreateDeviceInput;
}>;
export type CreateDeviceMutation = {
    __typename?: 'Mutation';
    createDevice: {
        __typename?: 'UserDeviceResponse';
        errorType?: UserDeviceErrorType | null;
        errorMessage?: string | null;
        data?: {
            __typename?: 'PushDevice';
            id: string;
            tokenId: string;
            deviceState: UserDeviceState;
            lastLoginDate: string;
        } | null;
    };
};
export type UpdateDeviceMutationVariables = Exact<{
    updateDeviceInput: UpdateDeviceInput;
}>;
export type UpdateDeviceMutation = {
    __typename?: 'Mutation';
    updateDevice: {
        __typename?: 'UserDeviceResponse';
        errorType?: UserDeviceErrorType | null;
        errorMessage?: string | null;
        data?: {
            __typename?: 'PushDevice';
            id: string;
            tokenId: string;
            deviceState: UserDeviceState;
            lastLoginDate: string;
        } | null;
    };
};
export type CreateNotificationMutationVariables = Exact<{
    createNotificationInput: CreateNotificationInput;
}>;
export type CreateNotificationMutation = {
    __typename?: 'Mutation';
    createNotification: {
        __typename?: 'CreateNotificationResponse';
        errorType?: NotificationsErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        data?: {
            __typename?: 'Notification';
            id: string;
            timestamp: number;
            notificationId: string;
            emailDestination?: string | null;
            userFullName?: string | null;
            type: NotificationType;
            channelType: NotificationChannelType;
            status: NotificationStatus;
            expoPushTokens?: Array<string | null> | null;
            pendingCashback?: number | null;
            merchantName?: string | null;
            actionUrl?: string | null;
            createdAt: string;
            updatedAt: string;
        } | null;
    };
};
export type CreateReimbursementEligibilityMutationVariables = Exact<{
    createReimbursementEligibilityInput: CreateReimbursementEligibilityInput;
}>;
export type CreateReimbursementEligibilityMutation = {
    __typename?: 'Mutation';
    createReimbursementEligibility: {
        __typename?: 'ReimbursementEligibilityResponse';
        errorType?: ReimbursementsErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        data?: {
            __typename?: 'ReimbursementEligibility';
            id: string;
            eligibilityStatus: ReimbursementEligibilityStatus;
            createdAt?: string | null;
            updatedAt: string;
        } | null;
    };
};
export type UpdateReimbursementEligibilityMutationVariables = Exact<{
    updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput;
}>;
export type UpdateReimbursementEligibilityMutation = {
    __typename?: 'Mutation';
    updateReimbursementEligibility: {
        __typename?: 'ReimbursementEligibilityResponse';
        errorType?: ReimbursementsErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        data?: {
            __typename?: 'ReimbursementEligibility';
            id: string;
            eligibilityStatus: ReimbursementEligibilityStatus;
            updatedAt: string;
        } | null;
    };
};
export type CreateReimbursementMutationVariables = Exact<{
    createReimbursementInput: CreateReimbursementInput;
}>;
export type CreateReimbursementMutation = {
    __typename?: 'Mutation';
    createReimbursement: {
        __typename?: 'ReimbursementResponse';
        errorType?: ReimbursementsErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        data?: {
            __typename?: 'Reimbursement';
            id: string;
            timestamp: number;
            reimbursementId: string;
            clientId?: string | null;
            paymentGatewayId?: string | null;
            succeeded?: boolean | null;
            processingMessage?: string | null;
            cardId: string;
            reimbursementStatus: ReimbursementStatus;
            pendingCashbackAmount: number;
            creditedCashbackAmount: number;
            currencyCode: CurrencyCodeType;
            createdAt: string;
            updatedAt: string;
            transactions: Array<{
                __typename?: 'ReimbursementTransaction';
                id: string;
                timestamp: number;
                transactionId: string;
                transactionStatus: TransactionsStatus;
            } | null>;
        } | null;
    };
};
export type UpdateReimbursementMutationVariables = Exact<{
    updateReimbursementInput: UpdateReimbursementInput;
}>;
export type UpdateReimbursementMutation = {
    __typename?: 'Mutation';
    updateReimbursement: {
        __typename?: 'ReimbursementResponse';
        errorType?: ReimbursementsErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        data?: {
            __typename?: 'Reimbursement';
            id: string;
            timestamp: number;
            reimbursementId: string;
            clientId?: string | null;
            paymentGatewayId?: string | null;
            succeeded?: boolean | null;
            processingMessage?: string | null;
            cardId: string;
            reimbursementStatus: ReimbursementStatus;
            pendingCashbackAmount: number;
            creditedCashbackAmount: number;
            currencyCode: CurrencyCodeType;
            createdAt: string;
            updatedAt: string;
            transactions: Array<{
                __typename?: 'ReimbursementTransaction';
                id: string;
                timestamp: number;
                transactionId: string;
                transactionStatus: TransactionsStatus;
            } | null>;
        } | null;
    };
};
export type CreateTransactionMutationVariables = Exact<{
    createTransactionInput: CreateTransactionInput;
}>;
export type CreateTransactionMutation = {
    __typename?: 'Mutation';
    createTransaction: {
        __typename?: 'MoonbeamTransactionResponse';
        errorType?: TransactionsErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        data?: {
            __typename?: 'MoonbeamTransaction';
            id: string;
            timestamp: number;
            transactionId: string;
            transactionStatus: TransactionsStatus;
            transactionType: TransactionType;
            createdAt: string;
            updatedAt: string;
            memberId: string;
            cardId: string;
            brandId: string;
            storeId: string;
            category: string;
            currencyCode: CurrencyCodeType;
            rewardAmount: number;
            totalAmount: number;
            pendingCashbackAmount: number;
            creditedCashbackAmount: number;
            transactionBrandName: string;
            transactionBrandAddress: string;
            transactionBrandLogoUrl: string;
            transactionBrandURLAddress: string;
            transactionIsOnline: boolean;
        } | null;
    };
};
export type UpdateTransactionMutationVariables = Exact<{
    updateTransactionInput: UpdateTransactionInput;
}>;
export type UpdateTransactionMutation = {
    __typename?: 'Mutation';
    updateTransaction: {
        __typename?: 'MoonbeamUpdatedTransactionResponse';
        errorType?: TransactionsErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        data?: {
            __typename?: 'MoonbeamUpdatedTransaction';
            id: string;
            timestamp: number;
            transactionId: string;
            transactionStatus: TransactionsStatus;
            updatedAt: string;
        } | null;
    };
};
export type CreateCardLinkMutationVariables = Exact<{
    createCardLinkInput: CreateCardLinkInput;
}>;
export type CreateCardLinkMutation = {
    __typename?: 'Mutation';
    createCardLink: {
        __typename?: 'CardLinkResponse';
        errorType?: CardLinkErrorType | null;
        errorMessage?: string | null;
        data?: {
            __typename?: 'CardLink';
            id: string;
            memberId: string;
            createdAt: string;
            updatedAt: string;
            status: CardLinkingStatus;
            cards: Array<{
                __typename?: 'Card';
                id: string;
                applicationID: string;
                token: string;
                type: CardType;
                name: string;
                last4: string;
                additionalProgramID?: string | null;
            } | null>;
        } | null;
    };
};
export type AddCardMutationVariables = Exact<{
    addCardInput: AddCardInput;
}>;
export type AddCardMutation = {
    __typename?: 'Mutation';
    addCard: {
        __typename?: 'CardLinkResponse';
        errorType?: CardLinkErrorType | null;
        errorMessage?: string | null;
        data?: {
            __typename?: 'CardLink';
            id: string;
            memberId: string;
            createdAt: string;
            updatedAt: string;
            status: CardLinkingStatus;
            cards: Array<{
                __typename?: 'Card';
                id: string;
                applicationID: string;
                token: string;
                type: CardType;
                name: string;
                last4: string;
                additionalProgramID?: string | null;
            } | null>;
        } | null;
    };
};
export type DeleteCardMutationVariables = Exact<{
    deleteCardInput: DeleteCardInput;
}>;
export type DeleteCardMutation = {
    __typename?: 'Mutation';
    deleteCard: {
        __typename?: 'CardResponse';
        errorType?: CardLinkErrorType | null;
        errorMessage?: string | null;
        data?: {
            __typename?: 'CardUpdate';
            id: string;
            cardId: string;
            updatedAt: string;
        } | null;
    };
};
export type CreateMilitaryVerificationMutationVariables = Exact<{
    createMilitaryVerificationInput: CreateMilitaryVerificationInput;
}>;
export type CreateMilitaryVerificationMutation = {
    __typename?: 'Mutation';
    createMilitaryVerification: {
        __typename?: 'CreateMilitaryVerificationResponse';
        errorType?: MilitaryVerificationErrorType | null;
        errorMessage?: string | null;
        data?: {
            __typename?: 'MilitaryVerificationInformation';
            id: string;
            firstName: string;
            lastName: string;
            dateOfBirth: string;
            enlistmentYear: string;
            addressLine: string;
            city: string;
            state: string;
            zipCode: string;
            createdAt: string;
            updatedAt: string;
            militaryDutyStatus: MilitaryDutyStatus;
            militaryBranch: MilitaryBranch;
            militaryAffiliation: MilitaryAffiliation;
            militaryVerificationStatus: MilitaryVerificationStatusType;
        } | null;
    };
};
export type UpdateMilitaryVerificationStatusMutationVariables = Exact<{
    updateMilitaryVerificationInput: UpdateMilitaryVerificationInput;
}>;
export type UpdateMilitaryVerificationStatusMutation = {
    __typename?: 'Mutation';
    updateMilitaryVerificationStatus: {
        __typename?: 'UpdateMilitaryVerificationResponse';
        errorType?: MilitaryVerificationErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        militaryVerificationStatus?: MilitaryVerificationStatusType | null;
    };
};
export type GetFaQsQueryVariables = Exact<{
    [key: string]: never;
}>;
export type GetFaQsQuery = {
    __typename?: 'Query';
    getFAQs: {
        __typename?: 'FAQResponse';
        errorMessage?: string | null;
        errorType?: FaqErrorType | null;
        data?: Array<{
            __typename?: 'FAQ';
            id: string;
            title: string;
            createdAt: string;
            updatedAt: string;
            facts: Array<{
                __typename?: 'Fact';
                description: string;
                linkableKeyword?: string | null;
                linkLocation?: string | null;
                type: FactType;
            } | null>;
        } | null> | null;
    };
};
export type GetFidelisPartnersQueryVariables = Exact<{
    [key: string]: never;
}>;
export type GetFidelisPartnersQuery = {
    __typename?: 'Query';
    getFidelisPartners: {
        __typename?: 'FidelisPartnerResponse';
        errorMessage?: string | null;
        errorType?: OffersErrorType | null;
        data?: Array<{
            __typename?: 'FidelisPartner';
            brandName: string;
            numberOfOffers: number;
            offers: Array<{
                __typename?: 'Offer';
                id?: string | null;
                corporateId?: string | null;
                created?: string | null;
                offerState?: OfferState | null;
                availability?: OfferAvailability | null;
                brandId?: string | null;
                brandDba?: string | null;
                brandLogo?: string | null;
                brandLogoSm?: string | null;
                brandBanner?: string | null;
                brandParentCategory?: string | null;
                brandStubCopy?: string | null;
                brandWebsite?: string | null;
                description?: string | null;
                reach?: OfferReach | null;
                title?: string | null;
                qualifier?: string | null;
                tile?: string | null;
                startDate?: string | null;
                endDate?: string | null;
                currency?: CurrencyCodeType | null;
                extOfferId?: string | null;
                supplierOfferKey?: string | null;
                redemptionType?: RedemptionType | null;
                redemptionInstructionUrl?: string | null;
                redemptionTrigger?: RedemptionTrigger | null;
                budget?: number | null;
                daysAvailability?: Array<number | null> | null;
                stores?: Array<string | null> | null;
                totalRedeemLimit?: number | null;
                redeemLimitPerUser?: number | null;
                purchaseAmount?: number | null;
                purchaseFrequency?: number | null;
                storeDetails?: Array<{
                    __typename?: 'OfferStore';
                    id?: string | null;
                    name?: string | null;
                    phone?: string | null;
                    address1?: string | null;
                    city?: string | null;
                    state?: string | null;
                    countryCode?: CountryCode | null;
                    postCode?: string | null;
                    isOnline?: boolean | null;
                    distance?: number | null;
                    geoLocation?: {
                        __typename?: 'OfferStoreGeoLocation';
                        latitude?: number | null;
                        longitude?: number | null;
                    } | null;
                } | null> | null;
                reward?: {
                    __typename?: 'Reward';
                    type?: RewardType | null;
                    value?: number | null;
                    maxValue?: number | null;
                } | null;
            } | null>;
        } | null> | null;
    };
};
export type GetOffersQueryVariables = Exact<{
    getOffersInput: GetOffersInput;
}>;
export type GetOffersQuery = {
    __typename?: 'Query';
    getOffers: {
        __typename?: 'OffersResponse';
        errorMessage?: string | null;
        errorType?: OffersErrorType | null;
        data?: {
            __typename?: 'OffersPaginatedResponse';
            totalNumberOfPages: number;
            totalNumberOfRecords: number;
            offers: Array<{
                __typename?: 'Offer';
                id?: string | null;
                corporateId?: string | null;
                created?: string | null;
                offerState?: OfferState | null;
                availability?: OfferAvailability | null;
                brandId?: string | null;
                brandDba?: string | null;
                brandLogo?: string | null;
                brandLogoSm?: string | null;
                brandBanner?: string | null;
                brandParentCategory?: string | null;
                brandStubCopy?: string | null;
                brandWebsite?: string | null;
                description?: string | null;
                reach?: OfferReach | null;
                title?: string | null;
                qualifier?: string | null;
                tile?: string | null;
                startDate?: string | null;
                endDate?: string | null;
                currency?: CurrencyCodeType | null;
                extOfferId?: string | null;
                supplierOfferKey?: string | null;
                redemptionType?: RedemptionType | null;
                redemptionInstructionUrl?: string | null;
                redemptionTrigger?: RedemptionTrigger | null;
                budget?: number | null;
                daysAvailability?: Array<number | null> | null;
                stores?: Array<string | null> | null;
                totalRedeemLimit?: number | null;
                redeemLimitPerUser?: number | null;
                purchaseAmount?: number | null;
                purchaseFrequency?: number | null;
                storeDetails?: Array<{
                    __typename?: 'OfferStore';
                    id?: string | null;
                    name?: string | null;
                    phone?: string | null;
                    address1?: string | null;
                    city?: string | null;
                    state?: string | null;
                    countryCode?: CountryCode | null;
                    postCode?: string | null;
                    isOnline?: boolean | null;
                    distance?: number | null;
                    geoLocation?: {
                        __typename?: 'OfferStoreGeoLocation';
                        latitude?: number | null;
                        longitude?: number | null;
                    } | null;
                } | null> | null;
                reward?: {
                    __typename?: 'Reward';
                    type?: RewardType | null;
                    value?: number | null;
                    maxValue?: number | null;
                } | null;
            } | null>;
        } | null;
    };
};
export type GetDevicesForUserQueryVariables = Exact<{
    getDevicesForUserInput: GetDevicesForUserInput;
}>;
export type GetDevicesForUserQuery = {
    __typename?: 'Query';
    getDevicesForUser: {
        __typename?: 'UserDevicesResponse';
        errorMessage?: string | null;
        errorType?: UserDeviceErrorType | null;
        data?: Array<{
            __typename?: 'PushDevice';
            id: string;
            tokenId: string;
            deviceState: UserDeviceState;
            lastLoginDate: string;
        } | null> | null;
    };
};
export type GetDeviceQueryVariables = Exact<{
    getDeviceInput: GetDeviceInput;
}>;
export type GetDeviceQuery = {
    __typename?: 'Query';
    getDevice: {
        __typename?: 'UserDeviceResponse';
        errorMessage?: string | null;
        errorType?: UserDeviceErrorType | null;
        data?: {
            __typename?: 'PushDevice';
            id: string;
            tokenId: string;
            deviceState: UserDeviceState;
            lastLoginDate: string;
        } | null;
    };
};
export type GetDeviceByTokenQueryVariables = Exact<{
    getDeviceByTokenInput: GetDeviceByTokenInput;
}>;
export type GetDeviceByTokenQuery = {
    __typename?: 'Query';
    getDeviceByToken: {
        __typename?: 'UserDeviceResponse';
        errorMessage?: string | null;
        errorType?: UserDeviceErrorType | null;
        data?: {
            __typename?: 'PushDevice';
            id: string;
            tokenId: string;
            deviceState: UserDeviceState;
            lastLoginDate: string;
        } | null;
    };
};
export type GetTransactionQueryVariables = Exact<{
    getTransactionInput: GetTransactionInput;
}>;
export type GetTransactionQuery = {
    __typename?: 'Query';
    getTransaction: {
        __typename?: 'MoonbeamTransactionsResponse';
        errorMessage?: string | null;
        errorType?: TransactionsErrorType | null;
        data?: Array<{
            __typename?: 'MoonbeamTransaction';
            id: string;
            timestamp: number;
            transactionId: string;
            transactionStatus: TransactionsStatus;
            transactionType: TransactionType;
            createdAt: string;
            updatedAt: string;
            memberId: string;
            cardId: string;
            brandId: string;
            storeId: string;
            category: string;
            currencyCode: CurrencyCodeType;
            rewardAmount: number;
            totalAmount: number;
            pendingCashbackAmount: number;
            creditedCashbackAmount: number;
            transactionBrandName: string;
            transactionBrandAddress: string;
            transactionBrandLogoUrl: string;
            transactionBrandURLAddress: string;
            transactionIsOnline: boolean;
        } | null> | null;
    };
};
export type GetReimbursementByStatusQueryVariables = Exact<{
    getReimbursementByStatusInput: GetReimbursementByStatusInput;
}>;
export type GetReimbursementByStatusQuery = {
    __typename?: 'Query';
    getReimbursementByStatus: {
        __typename?: 'ReimbursementByStatusResponse';
        errorMessage?: string | null;
        errorType?: ReimbursementsErrorType | null;
        data?: Array<{
            __typename?: 'Reimbursement';
            id: string;
            timestamp: number;
            reimbursementId: string;
            clientId?: string | null;
            paymentGatewayId?: string | null;
            succeeded?: boolean | null;
            processingMessage?: string | null;
            cardId: string;
            reimbursementStatus: ReimbursementStatus;
            pendingCashbackAmount: number;
            creditedCashbackAmount: number;
            currencyCode: CurrencyCodeType;
            createdAt: string;
            updatedAt: string;
            transactions: Array<{
                __typename?: 'ReimbursementTransaction';
                id: string;
                timestamp: number;
                transactionId: string;
                transactionStatus: TransactionsStatus;
            } | null>;
        } | null> | null;
    };
};
export type GetTransactionByStatusQueryVariables = Exact<{
    getTransactionByStatusInput: GetTransactionByStatusInput;
}>;
export type GetTransactionByStatusQuery = {
    __typename?: 'Query';
    getTransactionByStatus: {
        __typename?: 'MoonbeamTransactionsByStatusResponse';
        errorMessage?: string | null;
        errorType?: TransactionsErrorType | null;
        data?: Array<{
            __typename?: 'MoonbeamTransactionByStatus';
            id: string;
            timestamp: number;
            transactionId: string;
            transactionStatus: TransactionsStatus;
            creditedCashbackAmount: number;
            pendingCashbackAmount: number;
            rewardAmount: number;
            totalAmount: number;
        } | null> | null;
    };
};
export type GetCardLinkQueryVariables = Exact<{
    getCardLinkInput: GetCardLinkInput;
}>;
export type GetCardLinkQuery = {
    __typename?: 'Query';
    getCardLink: {
        __typename?: 'CardLinkResponse';
        errorMessage?: string | null;
        errorType?: CardLinkErrorType | null;
        data?: {
            __typename?: 'CardLink';
            id: string;
            memberId: string;
            createdAt: string;
            updatedAt: string;
            status: CardLinkingStatus;
            cards: Array<{
                __typename?: 'Card';
                id: string;
                applicationID: string;
                token: string;
                type: CardType;
                name: string;
                last4: string;
                additionalProgramID?: string | null;
            } | null>;
        } | null;
    };
};
export type GetEligibleLinkedUsersQueryVariables = Exact<{
    [key: string]: never;
}>;
export type GetEligibleLinkedUsersQuery = {
    __typename?: 'Query';
    getEligibleLinkedUsers: {
        __typename?: 'EligibleLinkedUsersResponse';
        errorMessage?: string | null;
        errorType?: CardLinkErrorType | null;
        data?: Array<{
            __typename?: 'EligibleLinkedUser';
            id: string;
            cardId: string;
            memberId: string;
        } | null> | null;
    };
};
export type GetStorageQueryVariables = Exact<{
    getStorageInput: GetStorageInput;
}>;
export type GetStorageQuery = {
    __typename?: 'Query';
    getStorage: {
        __typename?: 'StorageResponse';
        errorMessage?: string | null;
        errorType?: StorageErrorType | null;
        data?: {
            __typename?: 'File';
            url: string;
        } | null;
    };
};
export type GetMilitaryVerificationStatusQueryVariables = Exact<{
    getMilitaryVerificationInput: GetMilitaryVerificationInput;
}>;
export type GetMilitaryVerificationStatusQuery = {
    __typename?: 'Query';
    getMilitaryVerificationStatus: {
        __typename?: 'GetMilitaryVerificationResponse';
        errorMessage?: string | null;
        errorType?: MilitaryVerificationErrorType | null;
        data?: {
            __typename?: 'MilitaryVerificationStatus';
            id: string;
            militaryVerificationStatus: MilitaryVerificationStatusType;
        } | null;
    };
};
export type UpdatedMilitaryVerificationStatusSubscriptionVariables = Exact<{
    id: Scalars['ID'];
}>;
export type UpdatedMilitaryVerificationStatusSubscription = {
    __typename?: 'Subscription';
    updatedMilitaryVerificationStatus?: {
        __typename?: 'UpdateMilitaryVerificationResponse';
        errorType?: MilitaryVerificationErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        militaryVerificationStatus?: MilitaryVerificationStatusType | null;
    } | null;
};
export type CreatedTransactionSubscriptionVariables = Exact<{
    id: Scalars['ID'];
}>;
export type CreatedTransactionSubscription = {
    __typename?: 'Subscription';
    createdTransaction?: {
        __typename?: 'MoonbeamTransactionResponse';
        errorType?: TransactionsErrorType | null;
        errorMessage?: string | null;
        id?: string | null;
        data?: {
            __typename?: 'MoonbeamTransaction';
            id: string;
            timestamp: number;
            transactionId: string;
            transactionStatus: TransactionsStatus;
            transactionType: TransactionType;
            createdAt: string;
            updatedAt: string;
            memberId: string;
            cardId: string;
            brandId: string;
            storeId: string;
            category: string;
            currencyCode: CurrencyCodeType;
            rewardAmount: number;
            totalAmount: number;
            pendingCashbackAmount: number;
            creditedCashbackAmount: number;
            transactionBrandName: string;
            transactionBrandAddress: string;
            transactionBrandLogoUrl: string;
            transactionBrandURLAddress: string;
            transactionIsOnline: boolean;
        } | null;
    } | null;
};