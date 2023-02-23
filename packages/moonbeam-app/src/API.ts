/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateReferralInput = {
  id?: string | null,
  createdAt?: string | null,
  updatedAt?: string | null,
  status: ReferralStatus,
  offerType: OfferType,
  inviteeEmail: string,
  inviterEmail: string,
  _version?: number | null,
};

export enum ReferralStatus {
  REDEEMED = "REDEEMED",
  NOT_REDEEMED = "NOT_REDEEMED",
  INITIATED = "INITIATED",
}


export enum OfferType {
  WELCOME_REFERRAL_BONUS = "WELCOME_REFERRAL_BONUS",
}


export type ModelReferralConditionInput = {
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  status?: ModelReferralStatusInput | null,
  offerType?: ModelOfferTypeInput | null,
  inviteeEmail?: ModelStringInput | null,
  inviterEmail?: ModelStringInput | null,
  and?: Array< ModelReferralConditionInput | null > | null,
  or?: Array< ModelReferralConditionInput | null > | null,
  not?: ModelReferralConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelReferralStatusInput = {
  eq?: ReferralStatus | null,
  ne?: ReferralStatus | null,
};

export type ModelOfferTypeInput = {
  eq?: OfferType | null,
  ne?: OfferType | null,
};

export type Referral = {
  __typename: "Referral",
  id: string,
  createdAt: string,
  updatedAt: string,
  status: ReferralStatus,
  offerType: OfferType,
  inviteeEmail: string,
  inviterEmail: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  owner?: string | null,
};

export type UpdateReferralInput = {
  id: string,
  createdAt?: string | null,
  updatedAt?: string | null,
  status?: ReferralStatus | null,
  offerType?: OfferType | null,
  inviteeEmail?: string | null,
  inviterEmail?: string | null,
  _version?: number | null,
};

export type DeleteReferralInput = {
  id: string,
  _version?: number | null,
};

export type ModelReferralFilterInput = {
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  status?: ModelReferralStatusInput | null,
  offerType?: ModelOfferTypeInput | null,
  inviteeEmail?: ModelStringInput | null,
  inviterEmail?: ModelStringInput | null,
  and?: Array< ModelReferralFilterInput | null > | null,
  or?: Array< ModelReferralFilterInput | null > | null,
  not?: ModelReferralFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelReferralConnection = {
  __typename: "ModelReferralConnection",
  items:  Array<Referral | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelSubscriptionReferralFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  offerType?: ModelSubscriptionStringInput | null,
  inviteeEmail?: ModelSubscriptionStringInput | null,
  inviterEmail?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionReferralFilterInput | null > | null,
  or?: Array< ModelSubscriptionReferralFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type CreateReferralMutationVariables = {
  input: CreateReferralInput,
  condition?: ModelReferralConditionInput | null,
};

export type CreateReferralMutation = {
  createReferral?:  {
    __typename: "Referral",
    id: string,
    createdAt: string,
    updatedAt: string,
    status: ReferralStatus,
    offerType: OfferType,
    inviteeEmail: string,
    inviterEmail: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type UpdateReferralMutationVariables = {
  input: UpdateReferralInput,
  condition?: ModelReferralConditionInput | null,
};

export type UpdateReferralMutation = {
  updateReferral?:  {
    __typename: "Referral",
    id: string,
    createdAt: string,
    updatedAt: string,
    status: ReferralStatus,
    offerType: OfferType,
    inviteeEmail: string,
    inviterEmail: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type DeleteReferralMutationVariables = {
  input: DeleteReferralInput,
  condition?: ModelReferralConditionInput | null,
};

export type DeleteReferralMutation = {
  deleteReferral?:  {
    __typename: "Referral",
    id: string,
    createdAt: string,
    updatedAt: string,
    status: ReferralStatus,
    offerType: OfferType,
    inviteeEmail: string,
    inviterEmail: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type GetReferralQueryVariables = {
  id: string,
};

export type GetReferralQuery = {
  getReferral?:  {
    __typename: "Referral",
    id: string,
    createdAt: string,
    updatedAt: string,
    status: ReferralStatus,
    offerType: OfferType,
    inviteeEmail: string,
    inviterEmail: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type ListReferralsQueryVariables = {
  filter?: ModelReferralFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListReferralsQuery = {
  listReferrals?:  {
    __typename: "ModelReferralConnection",
    items:  Array< {
      __typename: "Referral",
      id: string,
      createdAt: string,
      updatedAt: string,
      status: ReferralStatus,
      offerType: OfferType,
      inviteeEmail: string,
      inviterEmail: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncReferralsQueryVariables = {
  filter?: ModelReferralFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncReferralsQuery = {
  syncReferrals?:  {
    __typename: "ModelReferralConnection",
    items:  Array< {
      __typename: "Referral",
      id: string,
      createdAt: string,
      updatedAt: string,
      status: ReferralStatus,
      offerType: OfferType,
      inviteeEmail: string,
      inviterEmail: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type OnCreateReferralSubscriptionVariables = {
  filter?: ModelSubscriptionReferralFilterInput | null,
  owner?: string | null,
};

export type OnCreateReferralSubscription = {
  onCreateReferral?:  {
    __typename: "Referral",
    id: string,
    createdAt: string,
    updatedAt: string,
    status: ReferralStatus,
    offerType: OfferType,
    inviteeEmail: string,
    inviterEmail: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnUpdateReferralSubscriptionVariables = {
  filter?: ModelSubscriptionReferralFilterInput | null,
  owner?: string | null,
};

export type OnUpdateReferralSubscription = {
  onUpdateReferral?:  {
    __typename: "Referral",
    id: string,
    createdAt: string,
    updatedAt: string,
    status: ReferralStatus,
    offerType: OfferType,
    inviteeEmail: string,
    inviterEmail: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnDeleteReferralSubscriptionVariables = {
  filter?: ModelSubscriptionReferralFilterInput | null,
  owner?: string | null,
};

export type OnDeleteReferralSubscription = {
  onDeleteReferral?:  {
    __typename: "Referral",
    id: string,
    createdAt: string,
    updatedAt: string,
    status: ReferralStatus,
    offerType: OfferType,
    inviteeEmail: string,
    inviterEmail: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};
