import * as FileSystem from "expo-file-system";
import {API, graphqlOperation, Storage} from "aws-amplify";
import {FileAccessLevel, FileType, getStorage, LoggingLevel} from "@moonbeam/moonbeam-models";
import {logEvent} from "./AppSync";

/**
 * Function used to upload a file to storage, given its URI, and privacy level, and
 * remove it from local storage.
 *
 * @param uri uri of the document to upload
 * @param privacyFlag privacy level flag
 * @param optionalFileName optional file name to be passed in, for cases where that's needed
 * @param notCached flag to indicate whether file will be cached or not
 *
 * @return an instance of {@link Promise} of a tuple containing a {@link boolean} and a {@link string}
 */
export const uploadFile = async (uri: string, privacyFlag: boolean, optionalFileName?: string, notCached?: boolean): Promise<[boolean, (string | null)]> => {
    try {
        // first retrieve file information from local storage
        const fileInfo = await FileSystem.getInfoAsync(uri);

        // retrieve the file name, from the URI passed in
        const uriSplit = uri.split('/');
        const fileName = optionalFileName ? optionalFileName : uriSplit[uriSplit.length - 1];

        // retrieve the file blob to upload from passed in URI
        const fileBlob = await (await (fetch(fileInfo.uri))).blob();

        // if the file exists in local storage, upload it, and then remove it
        if (fileInfo.exists) {
            // perform the query to fetch a file
            const result = await Storage.put(fileName, fileBlob, {
                level: privacyFlag ? 'private' : 'public'
            })

            // check to see if the upload was successful
            if (result && result.key) {
                const message = `File ${fileName} uploaded successfully!`;
                console.log(message);
                await logEvent(message, LoggingLevel.Info, false);

                // delete the file from local storage given its URI, before returning
                notCached !== undefined && notCached && await FileSystem.deleteAsync(fileInfo.uri);

                return [true, fileName];
            }
            const message = `File ${fileName} did not upload successfully!`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, false);

            return [false, fileName];
        }
        const message = `File ${fileName} to upload does not exist!`;
        console.log(message);
        await logEvent(message, LoggingLevel.Error, false);

        return [false, fileName];
    } catch (error) {
        const message = `Unexpected error while uploading file: ${error}`;
        console.log(message);
        await logEvent(message, LoggingLevel.Error, false);

        return [false, null];
    }
}

/**
 * Function used to fetch a file from CloudFront, given its name, and privacy level,
 * and store it and/or retrieve it from the local file system (if it is cached).
 *
 * @param name name of the document to fetch
 * @param privacyFlag privacy level flag
 * @param expires flag to be passed in
 * @param cached flag to indicate whether file will be cached or not
 * @param identity optional identity to be passed in, for cases where the privacy flag is
 * set to true, indicating a Private level
 *
 * @return an instance of {@link Promise} of a tuple containing a {@link boolean} and a {@link string}
 */
export const fetchFile = async (name: string, privacyFlag: boolean, expires: boolean, cached: boolean, identity?: string): Promise<[boolean, (string | null)]> => {
    try {
        // first check if the base directory exists or not
        const baseDir = `${FileSystem.documentDirectory!}` + `files/`;
        const baseDirInfo = await FileSystem.getInfoAsync(baseDir);
        if (!baseDirInfo.exists) {
            await FileSystem.makeDirectoryAsync(baseDir);
        }
        // then check if the file exists in the local file system storage
        const fileUri = baseDir + name;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        // remove the file from local storage depending on the cached flag
        if (!cached && fileInfo.exists) {
            const message = 'Removing pre-existing file from storage, given caching flag!';
            console.log(message);
            await logEvent(message, LoggingLevel.Info, false);

            await FileSystem.deleteAsync(fileUri);
        }

        // if the file already exists in local file system cache
        // ToDo: re-download the file after a certain time
        if (!cached || !fileInfo.exists) {
            const message = `${name} isn't cached locally. Downloading...`;
            console.log(message);
            await logEvent(message, LoggingLevel.Info, false);

            // perform the query to fetch a file
            const fetchFileResult = await API.graphql(graphqlOperation(getStorage, {
                getStorageInput: {
                    level: privacyFlag ? FileAccessLevel.Private : FileAccessLevel.Public,
                    type: FileType.Main,
                    name: name,
                    expires: expires,
                    ...(identity && identity.length !== 0) && {
                        id: identity
                    }
                }
            }));

            // @ts-ignore
            if (fetchFileResult && fetchFileResult.data.getStorage.errorMessage === null) {
                // @ts-ignore
                const retrievedURI = fetchFileResult.data.getStorage.data.url;
                const fileDownloadResult = await FileSystem.downloadAsync(retrievedURI, fileUri);

                // file did not exist or was force not cached, downloaded the file and return the appropriate URI
                return [true, cached ? fileDownloadResult.uri : retrievedURI];
            } else {
                const message = `Unexpected error while fetching file ${name} ${JSON.stringify(fetchFileResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, false);

                return [false, null];
            }
        } else {
            const message = `${name} is cached locally.`;
            console.log(message);
            await logEvent(message, LoggingLevel.Info, false);

            // file exists, just return the locally cached URI
            return [true, fileUri];
        }
    } catch (error) {
        const message = `Unexpected error while fetching file: ${error}`;
        console.log(message);
        await logEvent(message, LoggingLevel.Error, false);

        return [false, null];
    }
}

/**
 * Function used to check whether a given file size respects a particular threshold.
 *
 * @param fileSize size of file to be checked
 *
 * @return {@link Boolean} representing of flag of whether the file size is within the allotted range
 */
export const isValidSize = (fileSize: number): boolean => {
    return fileSize / 1024 / 1024 < 10;
}
