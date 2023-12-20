import { GetUserCardLinkingIdInput, GetUserCardLinkingIdResponse } from "@moonbeam/moonbeam-models";
/**
 * GetEligibleLinkedUsers resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getUserCardLinkingIdInput input containing the Moonbeam internal ID, used to
 * retrieve a user's card linking ID.
 * @returns {@link Promise} of {@link GetUserCardLinkingIdResponse}
 */
export declare const getUserCardLinkingId: (fieldName: string, getUserCardLinkingIdInput: GetUserCardLinkingIdInput) => Promise<GetUserCardLinkingIdResponse>;
