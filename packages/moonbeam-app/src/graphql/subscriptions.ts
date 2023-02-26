/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateReferral = /* GraphQL */ `
  subscription OnCreateReferral($filter: ModelSubscriptionReferralFilterInput) {
    onCreateReferral(filter: $filter) {
      id
      createdAt
      updatedAt
      status
      offerType
      inviteeEmail
      inviterEmail
      inviterName
      statusInviter
      statusInvitee
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateReferral = /* GraphQL */ `
  subscription OnUpdateReferral($filter: ModelSubscriptionReferralFilterInput) {
    onUpdateReferral(filter: $filter) {
      id
      createdAt
      updatedAt
      status
      offerType
      inviteeEmail
      inviterEmail
      inviterName
      statusInviter
      statusInvitee
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteReferral = /* GraphQL */ `
  subscription OnDeleteReferral($filter: ModelSubscriptionReferralFilterInput) {
    onDeleteReferral(filter: $filter) {
      id
      createdAt
      updatedAt
      status
      offerType
      inviteeEmail
      inviterEmail
      inviterName
      statusInviter
      statusInvitee
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
