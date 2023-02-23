import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

export enum ReferralStatus {
  REDEEMED = "REDEEMED",
  NOT_REDEEMED = "NOT_REDEEMED",
  INITIATED = "INITIATED",
  INVALID = "INVALID"
}

export enum OfferType {
  WELCOME_REFERRAL_BONUS = "WELCOME_REFERRAL_BONUS"
}



type EagerReferral = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Referral, 'id'>;
  };
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly status: ReferralStatus | keyof typeof ReferralStatus;
  readonly offerType: OfferType | keyof typeof OfferType;
  readonly inviteeEmail: string;
  readonly inviterEmail: string;
  readonly inviterName: string;
  readonly statusInviter: ReferralStatus | keyof typeof ReferralStatus;
  readonly statusInvitee: ReferralStatus | keyof typeof ReferralStatus;
}

type LazyReferral = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Referral, 'id'>;
  };
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly status: ReferralStatus | keyof typeof ReferralStatus;
  readonly offerType: OfferType | keyof typeof OfferType;
  readonly inviteeEmail: string;
  readonly inviterEmail: string;
  readonly inviterName: string;
  readonly statusInviter: ReferralStatus | keyof typeof ReferralStatus;
  readonly statusInvitee: ReferralStatus | keyof typeof ReferralStatus;
}

export declare type Referral = LazyLoading extends LazyLoadingDisabled ? EagerReferral : LazyReferral

export declare const Referral: (new (init: ModelInit<Referral>) => Referral) & {
  copyOf(source: Referral, mutator: (draft: MutableModel<Referral>) => MutableModel<Referral> | void): Referral;
}