import { FilesForUserResponse, GetFilesForUserInput } from "@moonbeam/moonbeam-models";
/**
 * GetFilesForUser resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getFilesForUserInput input, based on which the appropriate file are retrieved for a
 * given user, if applicable.
 *
 * @returns {@link Promise} of {@link FilesForUserResponse}
 */
export declare const getFilesForUser: (fieldName: string, getFilesForUserInput: GetFilesForUserInput) => Promise<FilesForUserResponse>;
