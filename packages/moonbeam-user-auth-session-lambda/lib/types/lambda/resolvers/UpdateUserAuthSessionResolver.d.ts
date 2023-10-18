import { UpdateUserAuthSessionInput, UserAuthSessionResponse } from "@moonbeam/moonbeam-models";
/**
 * UpdateUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateUserAuthSessionInput User Auth Session input object, used to update an existing session object (if found).
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
export declare const updateUserAuthSession: (fieldName: string, updateUserAuthSessionInput: UpdateUserAuthSessionInput) => Promise<UserAuthSessionResponse>;
