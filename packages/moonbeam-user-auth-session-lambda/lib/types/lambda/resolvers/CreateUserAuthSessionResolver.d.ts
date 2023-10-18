import { CreateUserAuthSessionInput, UserAuthSessionResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createUserAuthSessionInput User Auth Session input object, used to create a new User Auth Session object.
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
export declare const createUserAuthSession: (fieldName: string, createUserAuthSessionInput: CreateUserAuthSessionInput) => Promise<UserAuthSessionResponse>;
