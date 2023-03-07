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

export type ListReferralInput = {
  inviteeEmail?: InputMaybe<Scalars['String']>;
  inviterEmail?: InputMaybe<Scalars['String']>;
  status: ReferralStatus;
  statusInvitee?: InputMaybe<ReferralStatus>;
  statusInviter?: InputMaybe<ReferralStatus>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createReferral?: Maybe<ReferralResponse>;
  updateReferral?: Maybe<ReferralResponse>;
};


export type MutationCreateReferralArgs = {
  createInput: CreateReferralInput;
};


export type MutationUpdateReferralArgs = {
  updateInput: UpdateReferralInput;
};

export enum OfferType {
  WelcomeReferralBonus = 'WELCOME_REFERRAL_BONUS'
}

export type Query = {
  __typename?: 'Query';
  getReferral?: Maybe<ReferralResponse>;
  listReferrals?: Maybe<ReferralResponse>;
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

export type CreateReferralMutationVariables = Exact<{
  createInput: CreateReferralInput;
}>;


export type CreateReferralMutation = { __typename?: 'Mutation', createReferral?: { __typename?: 'ReferralResponse', errorType?: ReferralErrorType | null, errorMessage?: string | null, data?: Array<{ __typename?: 'Referral', id: string } | null> | null } | null };

export type UpdateReferralMutationVariables = Exact<{
  updateInput: UpdateReferralInput;
}>;


export type UpdateReferralMutation = { __typename?: 'Mutation', updateReferral?: { __typename?: 'ReferralResponse', errorType?: ReferralErrorType | null, errorMessage?: string | null, data?: Array<{ __typename?: 'Referral', id: string } | null> | null } | null };

export type GetReferralQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetReferralQuery = { __typename?: 'Query', getReferral?: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', id: string, inviterName: string, status: ReferralStatus } | null> | null } | null };

export type ListReferralsQueryVariables = Exact<{
  filter: ListReferralInput;
}>;


export type ListReferralsQuery = { __typename?: 'Query', listReferrals?: { __typename?: 'ReferralResponse', errorMessage?: string | null, errorType?: ReferralErrorType | null, data?: Array<{ __typename?: 'Referral', id: string } | null> | null } | null };
