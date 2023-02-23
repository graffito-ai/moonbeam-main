/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getReferral = /* GraphQL */ `
  query GetReferral($id: ID!) {
    getReferral(id: $id) {
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
      owner
    }
  }
`;
export const listReferrals = /* GraphQL */ `
  query ListReferrals(
    $filter: ModelReferralFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReferrals(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        owner
      }
      nextToken
      startedAt
    }
  }
`;
export const syncReferrals = /* GraphQL */ `
  query SyncReferrals(
    $filter: ModelReferralFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReferrals(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
        owner
      }
      nextToken
      startedAt
    }
  }
`;
