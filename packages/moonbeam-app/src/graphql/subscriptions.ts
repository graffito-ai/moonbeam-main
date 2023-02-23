/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateReferral = /* GraphQL */ `
  subscription OnCreateReferral(
    $filter: ModelSubscriptionReferralFilterInput
    $owner: String
  ) {
    onCreateReferral(filter: $filter, owner: $owner) {
      id
      createdAt
      updatedAt
      status
      offerType
      inviteeEmail
      inviterEmail
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
export const onUpdateReferral = /* GraphQL */ `
  subscription OnUpdateReferral(
    $filter: ModelSubscriptionReferralFilterInput
    $owner: String
  ) {
    onUpdateReferral(filter: $filter, owner: $owner) {
      id
      createdAt
      updatedAt
      status
      offerType
      inviteeEmail
      inviterEmail
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
export const onDeleteReferral = /* GraphQL */ `
  subscription OnDeleteReferral(
    $filter: ModelSubscriptionReferralFilterInput
    $owner: String
  ) {
    onDeleteReferral(filter: $filter, owner: $owner) {
      id
      createdAt
      updatedAt
      status
      offerType
      inviteeEmail
      inviterEmail
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
