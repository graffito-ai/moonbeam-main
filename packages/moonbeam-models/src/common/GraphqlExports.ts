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
  mask?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  type: AccountType;
  verificationStatus?: Maybe<AccountVerificationStatus>;
};

export type AccountInput = {
  id: Scalars['String'];
  mask?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  type: AccountType;
  verificationStatus?: InputMaybe<AccountVerificationStatus>;
};

export type AccountLinkDetails = {
  __typename?: 'AccountLinkDetails';
  accessToken?: Maybe<Scalars['String']>;
  accountLinkError?: Maybe<AccountLinkError>;
  accounts?: Maybe<Array<Maybe<Account>>>;
  exitStatus?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  institution?: Maybe<FinancialInstitution>;
  linkSessionId?: Maybe<Scalars['String']>;
  linkToken?: Maybe<Scalars['String']>;
  requestId?: Maybe<Scalars['String']>;
  userEmail: Scalars['String'];
  userName: Scalars['String'];
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
  data?: Maybe<AccountLinkDetails>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<LinkErrorType>;
};

export enum AccountType {
  Checking = 'CHECKING',
  Savings = 'SAVINGS'
}

export enum AccountVerificationStatus {
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Verified = 'VERIFIED'
}

export type CreateAccountLinkInput = {
  id: Scalars['ID'];
  userEmail: Scalars['String'];
  userName: Scalars['String'];
};

export type CreateReferralInput = {
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

export type FinancialInstitution = {
  __typename?: 'FinancialInstitution';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type FinancialInstitutionInput = {
  id?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
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

export type LinkTokenConfiguration = {
  __typename?: 'LinkTokenConfiguration';
  logLevel: LinkLogLevel;
  token: Scalars['String'];
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
  updateAccountLink?: Maybe<AccountLinkResponse>;
  updateReferral?: Maybe<ReferralResponse>;
};


export type MutationCreateAccountLinkArgs = {
  createAccountLinkInput: CreateAccountLinkInput;
};


export type MutationCreateReferralArgs = {
  createReferralInput: CreateReferralInput;
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
  listReferrals?: Maybe<ReferralResponse>;
};


export type QueryGetAccountLinkArgs = {
  id: Scalars['String'];
};


export type QueryGetReferralArgs = {
  id: Scalars['String'];
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

export type UpdateAccountLinkInput = {
  accessToken?: InputMaybe<Scalars['String']>;
  accountLinkError?: InputMaybe<AccountLinkErrorInput>;
  accounts?: InputMaybe<Array<InputMaybe<AccountInput>>>;
  exitStatus?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  institution?: InputMaybe<FinancialInstitutionInput>;
  requestId?: InputMaybe<Scalars['String']>;
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
  updatedAt: Scalars['AWSDateTime'];
};

export type GetReferralQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetReferralQuery = { __typename?: 'Query', getReferral?: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', id: string, inviterName: string, status: ReferralStatus } | null> | null } | null };

export type ListReferralsQueryVariables = Exact<{
  filter: ListReferralInput;
}>;


export type ListReferralsQuery = { __typename?: 'Query', listReferrals?: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', id: string } | null> | null } | null };
