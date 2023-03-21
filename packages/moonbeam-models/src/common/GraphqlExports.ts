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

export type Account = {
  __typename?: 'Account';
  id: Scalars['String'];
  mask: Scalars['String'];
  name: Scalars['String'];
  type: AccountType;
  verificationStatus: AccountVerificationStatus;
};

export type AccountDetails = {
  __typename?: 'AccountDetails';
  id: Scalars['String'];
  institution: FinancialInstitution;
  linkToken: Scalars['String'];
  mask: Scalars['String'];
  name: Scalars['String'];
  type: AccountType;
  verificationStatus: AccountVerificationStatus;
};

export type AccountDetailsInput = {
  id: Scalars['String'];
  institution: FinancialInstitutionInput;
  linkToken: Scalars['String'];
  mask: Scalars['String'];
  name: Scalars['String'];
  type: AccountType;
  verificationStatus: AccountVerificationStatus;
};

export type AccountInput = {
  id: Scalars['String'];
  mask: Scalars['String'];
  name: Scalars['String'];
  type: AccountType;
  verificationStatus: AccountVerificationStatus;
};

export type AccountLink = {
  __typename?: 'AccountLink';
  id: Scalars['ID'];
  links: Array<Maybe<AccountLinkDetails>>;
  userEmail?: Maybe<Scalars['String']>;
  userName?: Maybe<Scalars['String']>;
};

export type AccountLinkDetails = {
  __typename?: 'AccountLinkDetails';
  accessToken?: Maybe<Scalars['String']>;
  accountLinkError?: Maybe<AccountLinkError>;
  accounts?: Maybe<Array<Maybe<Account>>>;
  createdAt: Scalars['AWSDateTime'];
  exitStatus?: Maybe<Scalars['String']>;
  institution?: Maybe<FinancialInstitution>;
  itemId?: Maybe<Scalars['String']>;
  linkSessionId?: Maybe<Scalars['String']>;
  linkToken: Scalars['String'];
  publicToken?: Maybe<Scalars['String']>;
  requestId: Scalars['String'];
  updatedAt: Scalars['AWSDateTime'];
};

export type AccountLinkDetailsInput = {
  accessToken?: InputMaybe<Scalars['String']>;
  accountLinkError?: InputMaybe<AccountLinkErrorInput>;
  accounts?: InputMaybe<Array<InputMaybe<AccountInput>>>;
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  exitStatus?: InputMaybe<Scalars['String']>;
  institution?: InputMaybe<FinancialInstitutionInput>;
  itemId?: InputMaybe<Scalars['String']>;
  linkSessionId?: InputMaybe<Scalars['String']>;
  linkToken: Scalars['String'];
  publicToken?: InputMaybe<Scalars['String']>;
  requestId?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type AccountLinkError = {
  __typename?: 'AccountLinkError';
  errorMessage: Scalars['String'];
  errorType: Scalars['String'];
};

export type AccountLinkErrorInput = {
  errorMessage: Scalars['String'];
  errorType: Scalars['String'];
};

export type AccountLinkResponse = {
  __typename?: 'AccountLinkResponse';
  data?: Maybe<AccountLink>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<LinkErrorType>;
};

export type AccountResponse = {
  __typename?: 'AccountResponse';
  data?: Maybe<Array<Maybe<AccountDetails>>>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<LinkErrorType>;
};

export enum AccountType {
  Checking = 'CHECKING',
  Savings = 'SAVINGS',
  Unknown = 'UNKNOWN'
}

export enum AccountVerificationStatus {
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Unknown = 'UNKNOWN',
  Verified = 'VERIFIED'
}

export type CreateAccountLinkInput = {
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
  userEmail: Scalars['String'];
  userName: Scalars['String'];
};

export type CreateReferralInput = {
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  inviteeEmail: Scalars['String'];
  inviterEmail: Scalars['String'];
  inviterName: Scalars['String'];
  offerType: OfferType;
  status: ReferralStatus;
  statusInvitee: ReferralStatus;
  statusInviter: ReferralStatus;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type DeleteAccountInput = {
  accounts: Array<InputMaybe<AccountDetailsInput>>;
  id: Scalars['ID'];
  linkToken: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
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

export type FinancialInstitution = {
  __typename?: 'FinancialInstitution';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type FinancialInstitutionInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type GetStorageInput = {
  level: FileAccessLevel;
  name: Scalars['String'];
  type: FileType;
};

export enum LinkErrorType {
  NoneOrAbsent = 'NONE_OR_ABSENT',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export enum LinkLogLevel {
  Debug = 'DEBUG',
  Error = 'ERROR',
  Info = 'INFO',
  Warn = 'WARN'
}

export type ListAccountsInput = {
  id: Scalars['ID'];
  status?: InputMaybe<AccountVerificationStatus>;
};

export type ListReferralInput = {
  inviteeEmail?: InputMaybe<Scalars['String']>;
  inviterEmail?: InputMaybe<Scalars['String']>;
  status: ReferralStatus;
  statusInvitee?: InputMaybe<ReferralStatus>;
  statusInviter?: InputMaybe<ReferralStatus>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createAccountLink?: Maybe<AccountLinkResponse>;
  createReferral?: Maybe<ReferralResponse>;
  deleteAccount?: Maybe<AccountResponse>;
  updateAccountLink?: Maybe<AccountLinkResponse>;
  updateReferral?: Maybe<ReferralResponse>;
};


export type MutationCreateAccountLinkArgs = {
  createAccountLinkInput: CreateAccountLinkInput;
};


export type MutationCreateReferralArgs = {
  createReferralInput: CreateReferralInput;
};


export type MutationDeleteAccountArgs = {
  deleteAccountInput: DeleteAccountInput;
};


export type MutationUpdateAccountLinkArgs = {
  updateAccountLinkInput: UpdateAccountLinkInput;
};


export type MutationUpdateReferralArgs = {
  updateReferralInput: UpdateReferralInput;
};

export enum OfferType {
  WelcomeReferralBonus = 'WELCOME_REFERRAL_BONUS'
}

export type Query = {
  __typename?: 'Query';
  getAccountLink?: Maybe<AccountLinkResponse>;
  getReferral?: Maybe<ReferralResponse>;
  getStorage?: Maybe<StorageResponse>;
  listAccounts?: Maybe<AccountResponse>;
  listReferrals?: Maybe<ReferralResponse>;
};


export type QueryGetAccountLinkArgs = {
  id: Scalars['String'];
};


export type QueryGetReferralArgs = {
  id: Scalars['String'];
};


export type QueryGetStorageArgs = {
  getStorageInput: GetStorageInput;
};


export type QueryListAccountsArgs = {
  filter: ListAccountsInput;
};


export type QueryListReferralsArgs = {
  filter: ListReferralInput;
};

export type Referral = {
  __typename?: 'Referral';
  createdAt: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  inviteeEmail: Scalars['String'];
  inviterEmail: Scalars['String'];
  inviterName: Scalars['String'];
  offerType: OfferType;
  status: ReferralStatus;
  statusInvitee: ReferralStatus;
  statusInviter: ReferralStatus;
  updatedAt: Scalars['AWSDateTime'];
};

export enum ReferralErrorType {
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
  Initiated = 'INITIATED',
  Invalid = 'INVALID',
  NotRedeemed = 'NOT_REDEEMED',
  Redeemed = 'REDEEMED'
}

export enum StorageErrorType {
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

export type UpdateAccountLinkInput = {
  accountLinkDetails: AccountLinkDetailsInput;
  id: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type UpdateReferralInput = {
  createdAt?: InputMaybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  inviteeEmail?: InputMaybe<Scalars['String']>;
  inviterEmail?: InputMaybe<Scalars['String']>;
  inviterName?: InputMaybe<Scalars['String']>;
  offerType?: InputMaybe<OfferType>;
  status?: InputMaybe<ReferralStatus>;
  statusInvitee?: InputMaybe<ReferralStatus>;
  statusInviter?: InputMaybe<ReferralStatus>;
  updatedAt?: InputMaybe<Scalars['AWSDateTime']>;
};

export type GetReferralQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetReferralQuery = { __typename?: 'Query', getReferral?: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', id: string, inviterName: string, status: ReferralStatus } | null> | null } | null };

export type ListReferralsQueryVariables = Exact<{
  filter: ListReferralInput;
}>;


export type ListReferralsQuery = { __typename?: 'Query', listReferrals?: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', id: string } | null> | null } | null };

export type GetAccountLinkQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetAccountLinkQuery = { __typename?: 'Query', getAccountLink?: { __typename?: 'AccountLinkResponse', errorMessage?: string | null, errorType?: LinkErrorType | null, data?: { __typename?: 'AccountLink', id: string, links: Array<{ __typename?: 'AccountLinkDetails', publicToken?: string | null, accessToken?: string | null, linkToken: string, institution?: { __typename?: 'FinancialInstitution', name: string, id: string } | null, accounts?: Array<{ __typename?: 'Account', id: string } | null> | null } | null> } | null } | null };

export type ListAccountsQueryVariables = Exact<{
  filter: ListAccountsInput;
}>;


export type ListAccountsQuery = { __typename?: 'Query', listAccounts?: { __typename?: 'AccountResponse', errorMessage?: string | null, errorType?: LinkErrorType | null, data?: Array<{ __typename?: 'AccountDetails', id: string, name: string, mask: string, type: AccountType, verificationStatus: AccountVerificationStatus, linkToken: string, institution: { __typename?: 'FinancialInstitution', id: string, name: string } } | null> | null } | null };
