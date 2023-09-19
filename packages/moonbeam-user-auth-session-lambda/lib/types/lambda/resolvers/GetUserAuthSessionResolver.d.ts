import { GetUserAuthSessionInput, UserAuthSessionResponse } from "@moonbeam/moonbeam-models";
/**
 * GetUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getUserAuthSessionInput user auth session input, used to retrieved the appropriate session
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
export declare const getUserAuthSession: (fieldName: string, getUserAuthSessionInput: GetUserAuthSessionInput) => Promise<UserAuthSessionResponse>;
