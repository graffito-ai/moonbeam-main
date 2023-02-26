/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createReferral = /* GraphQL */ `
  mutation CreateReferral(
    $input: CreateReferralInput!
    $condition: ModelReferralConditionInput
  ) {
    createReferral(input: $input, condition: $condition) {
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
export const updateReferral = /* GraphQL */ `
  mutation UpdateReferral(
    $input: UpdateReferralInput!
    $condition: ModelReferralConditionInput
  ) {
    updateReferral(input: $input, condition: $condition) {
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
export const deleteReferral = /* GraphQL */ `
  mutation DeleteReferral(
    $input: DeleteReferralInput!
    $condition: ModelReferralConditionInput
  ) {
    deleteReferral(input: $input, condition: $condition) {
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
