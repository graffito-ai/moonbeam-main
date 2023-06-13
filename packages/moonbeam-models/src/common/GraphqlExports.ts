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

export type Card = {
  __typename?: 'Card';
  additionalProgramID?: Maybe<Scalars['String']>;
  applicationID: Scalars['ID'];
  createdAt: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  last4: Scalars['String'];
  name: Scalars['String'];
  token: Scalars['String'];
  type: CardType;
  updatedAt: Scalars['AWSDateTime'];
};

export type CardInput = {
  additionalProgramID?: InputMaybe<Scalars['String']>;
  applicationID?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  last4: Scalars['String'];
  name: Scalars['String'];
  token: Scalars['String'];
  type: CardType;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type CardLink = {
  __typename?: 'CardLink';
  cards: Array<Maybe<Card>>;
  id: Scalars['ID'];
  memberId: Scalars['ID'];
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

export enum CardType {
  Invalid = 'INVALID',
  Mastercard = 'MASTERCARD',
  Visa = 'VISA'
}

export type CreateCardLinkInput = {
  card: CardInput;
  id: Scalars['ID'];
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

export type DeleteCardInput = {
  cardId: Scalars['ID'];
  id: Scalars['ID'];
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

export type GetStorageInput = {
  expires?: InputMaybe<Scalars['Boolean']>;
  level: FileAccessLevel;
  name: Scalars['String'];
  type: FileType;
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

export type Mutation = {
  __typename?: 'Mutation';
  createCardLink: CardLinkResponse;
  createMilitaryVerification: CreateMilitaryVerificationResponse;
  deleteCard: CardLinkResponse;
  updateMilitaryVerificationStatus: UpdateMilitaryVerificationResponse;
};


export type MutationCreateCardLinkArgs = {
  createCardLinkInput: CreateCardLinkInput;
};


export type MutationCreateMilitaryVerificationArgs = {
  createMilitaryVerificationInput: CreateMilitaryVerificationInput;
};


export type MutationDeleteCardArgs = {
  deleteCardInput: DeleteCardInput;
};


export type MutationUpdateMilitaryVerificationStatusArgs = {
  updateMilitaryVerificationInput: UpdateMilitaryVerificationInput;
};

export type Query = {
  __typename?: 'Query';
  getCardLink: CardLinkResponse;
  getMilitaryVerificationStatus: GetMilitaryVerificationResponse;
  getStorage: StorageResponse;
};


export type QueryGetCardLinkArgs = {
  getCardLinkInput: GetCardLinkInput;
};


export type QueryGetMilitaryVerificationStatusArgs = {
  getMilitaryVerificationInput: GetMilitaryVerificationInput;
};


export type QueryGetStorageArgs = {
  getStorageInput: GetStorageInput;
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
  updatedMilitaryVerificationStatus?: Maybe<UpdateMilitaryVerificationResponse>;
};


export type SubscriptionUpdatedMilitaryVerificationStatusArgs = {
  id: Scalars['ID'];
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

export type CreateCardLinkMutationVariables = Exact<{
  createCardLinkInput: CreateCardLinkInput;
}>;


export type CreateCardLinkMutation = { __typename?: 'Mutation', createCardLink: { __typename?: 'CardLinkResponse', errorType?: CardLinkErrorType | null, errorMessage?: string | null, data?: { __typename?: 'CardLink', id: string, memberId: string, cards: Array<{ __typename?: 'Card', id: string, applicationID: string, token: string, type: CardType, name: string, last4: string, additionalProgramID?: string | null, createdAt: string, updatedAt: string } | null> } | null } };

export type DeleteCardMutationVariables = Exact<{
  deleteCardInput: DeleteCardInput;
}>;


export type DeleteCardMutation = { __typename?: 'Mutation', deleteCard: { __typename?: 'CardLinkResponse', errorType?: CardLinkErrorType | null, errorMessage?: string | null, data?: { __typename?: 'CardLink', id: string, cards: Array<{ __typename?: 'Card', id: string, token: string, type: CardType, name: string, last4: string, additionalProgramID?: string | null, createdAt: string, updatedAt: string } | null> } | null } };

export type CreateMilitaryVerificationMutationVariables = Exact<{
  createMilitaryVerificationInput: CreateMilitaryVerificationInput;
}>;


export type CreateMilitaryVerificationMutation = { __typename?: 'Mutation', createMilitaryVerification: { __typename?: 'CreateMilitaryVerificationResponse', errorType?: MilitaryVerificationErrorType | null, errorMessage?: string | null, data?: { __typename?: 'MilitaryVerificationInformation', id: string, firstName: string, lastName: string, dateOfBirth: string, enlistmentYear: string, addressLine: string, city: string, state: string, zipCode: string, createdAt: string, updatedAt: string, militaryDutyStatus: MilitaryDutyStatus, militaryBranch: MilitaryBranch, militaryAffiliation: MilitaryAffiliation, militaryVerificationStatus: MilitaryVerificationStatusType } | null } };

export type UpdateMilitaryVerificationStatusMutationVariables = Exact<{
  updateMilitaryVerificationInput: UpdateMilitaryVerificationInput;
}>;


export type UpdateMilitaryVerificationStatusMutation = { __typename?: 'Mutation', updateMilitaryVerificationStatus: { __typename?: 'UpdateMilitaryVerificationResponse', errorType?: MilitaryVerificationErrorType | null, errorMessage?: string | null, id?: string | null, militaryVerificationStatus?: MilitaryVerificationStatusType | null } };

export type GetCardLinkQueryVariables = Exact<{
  getCardLinkInput: GetCardLinkInput;
}>;


export type GetCardLinkQuery = { __typename?: 'Query', getCardLink: { __typename?: 'CardLinkResponse', errorMessage?: string | null, errorType?: CardLinkErrorType | null, data?: { __typename?: 'CardLink', id: string, memberId: string, cards: Array<{ __typename?: 'Card', id: string, applicationID: string, token: string, type: CardType, name: string, last4: string, additionalProgramID?: string | null, createdAt: string, updatedAt: string } | null> } | null } };

export type GetMilitaryVerificationStatusQueryVariables = Exact<{
  getMilitaryVerificationInput: GetMilitaryVerificationInput;
}>;


export type GetMilitaryVerificationStatusQuery = { __typename?: 'Query', getMilitaryVerificationStatus: { __typename?: 'GetMilitaryVerificationResponse', errorMessage?: string | null, errorType?: MilitaryVerificationErrorType | null, data?: { __typename?: 'MilitaryVerificationStatus', id: string, militaryVerificationStatus: MilitaryVerificationStatusType } | null } };

export type UpdatedMilitaryVerificationStatusSubscriptionVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UpdatedMilitaryVerificationStatusSubscription = { __typename?: 'Subscription', updatedMilitaryVerificationStatus?: { __typename?: 'UpdateMilitaryVerificationResponse', errorType?: MilitaryVerificationErrorType | null, errorMessage?: string | null, id?: string | null, militaryVerificationStatus?: MilitaryVerificationStatusType | null } | null };
