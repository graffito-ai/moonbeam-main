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

export type CreateCardLinkInput = {
  card: CardInput;
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
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

export enum CurrencyCodeType {
  Usd = 'USD'
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
  Main = 'MAIN'
}

export type GetCardLinkInput = {
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
  SpaceForce = 'SPACE_FORCE'
}

export enum MilitaryDutyStatus {
  ActiveDuty = 'ACTIVE_DUTY',
  NationalGuard = 'NATIONAL_GUARD',
  Reservist = 'RESERVIST',
  Veteran = 'VETERAN'
}

export enum MilitaryVerificationErrorType {
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
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
  id: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
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
  createMilitaryVerification: CreateMilitaryVerificationResponse;
  createReimbursement: ReimbursementResponse;
  createReimbursementEligibility: ReimbursementEligibilityResponse;
  createTransaction: MoonbeamTransactionResponse;
  deleteCard: CardResponse;
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


export type MutationCreateMilitaryVerificationArgs = {
  createMilitaryVerificationInput: CreateMilitaryVerificationInput;
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

export type Query = {
  __typename?: 'Query';
  getCardLink: CardLinkResponse;
  getEligibleLinkedUsers: EligibleLinkedUsersResponse;
  getMilitaryVerificationStatus: GetMilitaryVerificationResponse;
  getReimbursementByStatus: ReimbursementByStatusResponse;
  getStorage: StorageResponse;
  getTransaction: MoonbeamTransactionsResponse;
  getTransactionByStatus: MoonbeamTransactionsByStatusResponse;
};


export type QueryGetCardLinkArgs = {
  getCardLinkInput: GetCardLinkInput;
};


export type QueryGetMilitaryVerificationStatusArgs = {
  getMilitaryVerificationInput: GetMilitaryVerificationInput;
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

export enum ReimbursementEligibilityStatus {
  Eligible = 'ELIGIBLE',
  Ineligible = 'INELIGIBLE'
}

export type ReimbursementResponse = {
  __typename?: 'ReimbursementResponse';
  data?: Maybe<Reimbursement>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<ReimbursementsErrorType>;
  id?: Maybe<Scalars['ID']>;
};

export enum ReimbursementStatus {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processed = 'PROCESSED'
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

export enum ReimbursementsErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  Unprocessable = 'UNPROCESSABLE',
  ValidationError = 'VALIDATION_ERROR'
}

export type RemoveCardResponse = {
  __typename?: 'RemoveCardResponse';
  data?: Maybe<Scalars['Boolean']>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<CardLinkErrorType>;
};

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

export type TransactionStatusResponse = {
  __typename?: 'TransactionStatusResponse';
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<TransactionsErrorType>;
  oliveTransactionStatus?: Maybe<Scalars['String']>;
};

export enum TransactionType {
  Contribution = 'CONTRIBUTION',
  OfferRedeemed = 'OFFER_REDEEMED',
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
  Pending = 'PENDING',
  Processed = 'PROCESSED',
  Rejected = 'REJECTED'
}

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

export type UpdateTransactionInput = {
  id: Scalars['ID'];
  timestamp: Scalars['AWSTimestamp'];
  transactionId: Scalars['ID'];
  transactionStatus: TransactionsStatus;
  updatedAt: Scalars['AWSDateTime'];
};

export type CreateReimbursementEligibilityMutationVariables = Exact<{
  createReimbursementEligibilityInput: CreateReimbursementEligibilityInput;
}>;


export type CreateReimbursementEligibilityMutation = { __typename?: 'Mutation', createReimbursementEligibility: { __typename?: 'ReimbursementEligibilityResponse', errorType?: ReimbursementsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'ReimbursementEligibility', id: string, eligibilityStatus: ReimbursementEligibilityStatus, createdAt?: string | null, updatedAt: string } | null } };

export type UpdateReimbursementEligibilityMutationVariables = Exact<{
  updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput;
}>;


export type UpdateReimbursementEligibilityMutation = { __typename?: 'Mutation', updateReimbursementEligibility: { __typename?: 'ReimbursementEligibilityResponse', errorType?: ReimbursementsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'ReimbursementEligibility', id: string, eligibilityStatus: ReimbursementEligibilityStatus, updatedAt: string } | null } };

export type CreateReimbursementMutationVariables = Exact<{
  createReimbursementInput: CreateReimbursementInput;
}>;


export type CreateReimbursementMutation = { __typename?: 'Mutation', createReimbursement: { __typename?: 'ReimbursementResponse', errorType?: ReimbursementsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'Reimbursement', id: string, timestamp: number, reimbursementId: string, clientId?: string | null, paymentGatewayId?: string | null, succeeded?: boolean | null, processingMessage?: string | null, cardId: string, reimbursementStatus: ReimbursementStatus, pendingCashbackAmount: number, creditedCashbackAmount: number, currencyCode: CurrencyCodeType, createdAt: string, updatedAt: string, transactions: Array<{ __typename?: 'ReimbursementTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus } | null> } | null } };

export type UpdateReimbursementMutationVariables = Exact<{
  updateReimbursementInput: UpdateReimbursementInput;
}>;


export type UpdateReimbursementMutation = { __typename?: 'Mutation', updateReimbursement: { __typename?: 'ReimbursementResponse', errorType?: ReimbursementsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'Reimbursement', id: string, timestamp: number, reimbursementId: string, clientId?: string | null, paymentGatewayId?: string | null, succeeded?: boolean | null, processingMessage?: string | null, cardId: string, reimbursementStatus: ReimbursementStatus, pendingCashbackAmount: number, creditedCashbackAmount: number, currencyCode: CurrencyCodeType, createdAt: string, updatedAt: string, transactions: Array<{ __typename?: 'ReimbursementTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus } | null> } | null } };

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


export type CreateCardLinkMutation = { __typename?: 'Mutation', createCardLink: { __typename?: 'CardLinkResponse', errorType?: CardLinkErrorType | null, errorMessage?: string | null, data?: { __typename?: 'CardLink', id: string, memberId: string, createdAt: string, updatedAt: string, status: CardLinkingStatus, cards: Array<{ __typename?: 'Card', id: string, applicationID: string, token: string, type: CardType, name: string, last4: string, additionalProgramID?: string | null } | null> } | null } };

export type AddCardMutationVariables = Exact<{
  addCardInput: AddCardInput;
}>;


export type AddCardMutation = { __typename?: 'Mutation', addCard: { __typename?: 'CardLinkResponse', errorType?: CardLinkErrorType | null, errorMessage?: string | null, data?: { __typename?: 'CardLink', id: string, memberId: string, createdAt: string, updatedAt: string, status: CardLinkingStatus, cards: Array<{ __typename?: 'Card', id: string, applicationID: string, token: string, type: CardType, name: string, last4: string, additionalProgramID?: string | null } | null> } | null } };

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

export type GetTransactionQueryVariables = Exact<{
  getTransactionInput: GetTransactionInput;
}>;


export type GetTransactionQuery = { __typename?: 'Query', getTransaction: { __typename?: 'MoonbeamTransactionsResponse', errorMessage?: string | null, errorType?: TransactionsErrorType | null, data?: Array<{ __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null> | null } };

export type GetReimbursementByStatusQueryVariables = Exact<{
  getReimbursementByStatusInput: GetReimbursementByStatusInput;
}>;


export type GetReimbursementByStatusQuery = { __typename?: 'Query', getReimbursementByStatus: { __typename?: 'ReimbursementByStatusResponse', errorMessage?: string | null, errorType?: ReimbursementsErrorType | null, data?: Array<{ __typename?: 'Reimbursement', id: string, timestamp: number, reimbursementId: string, clientId?: string | null, paymentGatewayId?: string | null, succeeded?: boolean | null, processingMessage?: string | null, cardId: string, reimbursementStatus: ReimbursementStatus, pendingCashbackAmount: number, creditedCashbackAmount: number, currencyCode: CurrencyCodeType, createdAt: string, updatedAt: string, transactions: Array<{ __typename?: 'ReimbursementTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus } | null> } | null> | null } };

export type GetTransactionByStatusQueryVariables = Exact<{
  getTransactionByStatusInput: GetTransactionByStatusInput;
}>;


export type GetTransactionByStatusQuery = { __typename?: 'Query', getTransactionByStatus: { __typename?: 'MoonbeamTransactionsByStatusResponse', errorMessage?: string | null, errorType?: TransactionsErrorType | null, data?: Array<{ __typename?: 'MoonbeamTransactionByStatus', id: string, transactionStatus: TransactionsStatus } | null> | null } };

export type GetCardLinkQueryVariables = Exact<{
  getCardLinkInput: GetCardLinkInput;
}>;


export type GetCardLinkQuery = { __typename?: 'Query', getCardLink: { __typename?: 'CardLinkResponse', errorMessage?: string | null, errorType?: CardLinkErrorType | null, data?: { __typename?: 'CardLink', id: string, memberId: string, createdAt: string, updatedAt: string, status: CardLinkingStatus, cards: Array<{ __typename?: 'Card', id: string, applicationID: string, token: string, type: CardType, name: string, last4: string, additionalProgramID?: string | null } | null> } | null } };

export type GetEligibleLinkedUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEligibleLinkedUsersQuery = { __typename?: 'Query', getEligibleLinkedUsers: { __typename?: 'EligibleLinkedUsersResponse', errorMessage?: string | null, errorType?: CardLinkErrorType | null, data?: Array<{ __typename?: 'EligibleLinkedUser', id: string, cardId: string, memberId: string } | null> | null } };

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

export type CreatedTransactionSubscriptionVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CreatedTransactionSubscription = { __typename?: 'Subscription', createdTransaction?: { __typename?: 'MoonbeamTransactionResponse', errorType?: TransactionsErrorType | null, errorMessage?: string | null, id?: string | null, data?: { __typename?: 'MoonbeamTransaction', id: string, timestamp: number, transactionId: string, transactionStatus: TransactionsStatus, transactionType: TransactionType, createdAt: string, updatedAt: string, memberId: string, cardId: string, brandId: string, storeId: string, category: string, currencyCode: CurrencyCodeType, rewardAmount: number, totalAmount: number, pendingCashbackAmount: number, creditedCashbackAmount: number, transactionBrandName: string, transactionBrandAddress: string, transactionBrandLogoUrl: string, transactionBrandURLAddress: string, transactionIsOnline: boolean } | null } | null };
