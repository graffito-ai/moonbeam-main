import * as FileSystem from "expo-file-system";
import {API, graphqlOperation, Storage} from "aws-amplify";
import {FileAccessLevel, FileType, getStorage} from "@moonbeam/moonbeam-models";

/**
 * Function used to upload a file to storage, given its URI, and privacy level, and
 * remove it from local storage.
 *
 * @param uri uri of the document to upload
 * @param privacyFlag privacy level flag
 *
 * @return an instance of {@link Promise} of a tuple containing a {@link boolean} and a {@link string}
 */
export const uploadFile = async (uri: string, privacyFlag: boolean): Promise<[boolean, (string | null)]> => {
    try {
        // first retrieve file information from local storage
        const fileInfo = await FileSystem.getInfoAsync(uri);

        // retrieve the file name, from the URI passed in
        const uriSplit = uri.split('/');
        const fileName = uriSplit[uriSplit.length - 1];

        // retrieve the file blob to upload from passed in URI
        const fileBlob = await (await(fetch(fileInfo.uri))).blob();

        // if the file exists in local storage, upload it, and then remove it
        if (fileInfo.exists) {
            // perform the query to fetch a file
            const result = await Storage.put(fileName, fileBlob, {
                level: privacyFlag ? 'private' : 'public'
            })

            // check to see if the upload was successful
            if (result && result.key) {
                console.log(`File ${fileName} uploaded successfully!`);

                // delete the file from local storage given its URI, before returning
                await FileSystem.deleteAsync(fileInfo.uri);

                return [true, fileName];
            }
            console.log(`File ${fileName} did not upload successfully!`);
            return [false, fileName];
        }
        console.log(`File ${fileName} to upload does not exist!`);
        return [false, fileName];
    } catch (error) {
        console.log(`Unexpected error while uploading file: ${error}`);
        return [false, null];
    }
}


/**
 * Function used to fetch a file from CloudFront, given its name, and privacy level,
 * and store it and/or retrieve it from the local file system (if it is cached).
 *
 * @param name name of the document to fetch
 * @param privacyFlag privacy level flag
 *
 * @return an instance of {@link Promise} of a tuple containing a {@link boolean} and a {@link string}
 */
export const fetchFile = async (name: string, privacyFlag: boolean): Promise<[boolean, (string | null)]> => {
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

        // if the file already exists in local file system cache
        // ToDo: re-download the file after a certain time
        if (!fileInfo.exists) {
            console.log(`${name} isn't cached locally. Downloading...`);
            // perform the query to fetch a file
            const fetchFileResult = await API.graphql(graphqlOperation(getStorage, {
                getStorageInput: {
                    level: privacyFlag ? FileAccessLevel.Private : FileAccessLevel.Public,
                    type: FileType.Main,
                    name: name
                }
            }));
            // @ts-ignore
            if (fetchFileResult && fetchFileResult.data.getStorage.errorMessage === null) {
                // @ts-ignore
                const retrievedURI = fetchFileResult.data.getStorage.data.url;
                const fileDownloadResult = await FileSystem.downloadAsync(retrievedURI, fileUri);

                // file did not exist, downloaded the file and return the newly locally cached URI
                return [true, fileDownloadResult.uri];
            } else {
                console.log(`Unexpected error while fetching file ${name} ${JSON.stringify(fetchFileResult)}`);
                return [false, null];
            }
        }
        console.log(`${name} is cached locally.`);

        // file exists, just return the locally cached URI
        return [true, fileUri];
    } catch (error) {
        console.log(`Unexpected error while fetching file: ${JSON.stringify(error)}`);

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
